import { Server } from 'socket.io';
import type { Server as HttpServer } from 'http';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
} from '../types/index';
import { sseManager } from '../sse/manager';
import { saveMessage, getRecentMessages } from '../services/message.service';
import config from '../config/config';
import logger from '../utils/logger.util';

export type SocketServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

// In-memory presence: roomId → Set of usernames currently online
const onlineUsers = new Map<string, Set<string>>();

export function getOnlineUsers(roomId: string): string[] {
  return [...(onlineUsers.get(roomId) ?? [])];
}

export let io: SocketServer;

export function initSocket(server: HttpServer): SocketServer {
  io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(
    server,
    {
      cors: {
        origin: config.corsOrigin,
        methods: ['GET', 'POST'],
      },
    }
  );

  io.on('connection', (socket) => {
    logger.info('Socket connected', { socketId: socket.id });

    // ── join_room ──────────────────────────────────────────────────────
    socket.on('join_room', async ({ roomId, username }) => {
      socket.join(roomId);
      socket.data.username = username;
      socket.data.roomId = roomId;

      // Update in-memory presence
      if (!onlineUsers.has(roomId)) onlineUsers.set(roomId, new Set());
      onlineUsers.get(roomId)!.add(username);

      logger.info('User joined room', { username, roomId });

      // Notify everyone in the room via Socket.io
      io.to(roomId).emit('user_joined', { username, roomId });
      io.to(roomId).emit('room_presence', { roomId, onlineUsers: getOnlineUsers(roomId) });

      // Push updated presence to SSE clients (typing indicator page)
      sseManager.broadcast(roomId, 'presence', { onlineUsers: getOnlineUsers(roomId) });

      // Send message history only to the joining socket
      try {
        const history = await getRecentMessages(roomId, 50);
        socket.emit('message_history', history);
      } catch (err) {
        logger.error('Failed to load message history', { error: (err as Error).message, roomId });
      }
    });

    // ── leave_room ─────────────────────────────────────────────────────
    socket.on('leave_room', ({ roomId, username }) => {
      socket.leave(roomId);
      onlineUsers.get(roomId)?.delete(username);

      logger.info('User left room', { username, roomId });

      io.to(roomId).emit('user_left', { username, roomId });
      io.to(roomId).emit('room_presence', { roomId, onlineUsers: getOnlineUsers(roomId) });
      sseManager.broadcast(roomId, 'presence', { onlineUsers: getOnlineUsers(roomId) });
    });

    // ── send_message ───────────────────────────────────────────────────
    socket.on('send_message', async ({ roomId, username, content }) => {
      try {
        const message = await saveMessage({ roomId, username, content });
        // Broadcast to everyone in the room (including sender)
        io.to(roomId).emit('message_received', message);
        logger.info('Message sent', { roomId, username, messageId: message.id });
      } catch (err) {
        logger.error('Failed to save message', { error: (err as Error).message });
      }
    });

    // ── typing_start ───────────────────────────────────────────────────
    socket.on('typing_start', ({ roomId, username }) => {
      // Push typing indicator via SSE (not Socket.io broadcast)
      sseManager.broadcast(roomId, 'typing', { username, isTyping: true });
    });

    // ── typing_stop ────────────────────────────────────────────────────
    socket.on('typing_stop', ({ roomId, username }) => {
      sseManager.broadcast(roomId, 'typing', { username, isTyping: false });
    });

    // ── disconnect ─────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      const { username, roomId } = socket.data;
      if (username && roomId) {
        onlineUsers.get(roomId)?.delete(username);
        io.to(roomId).emit('user_left', { username, roomId });
        io.to(roomId).emit('room_presence', { roomId, onlineUsers: getOnlineUsers(roomId) });
        sseManager.broadcast(roomId, 'presence', { onlineUsers: getOnlineUsers(roomId) });
      }
      logger.info('Socket disconnected', { socketId: socket.id, username });
    });
  });

  logger.info('Socket.io initialized');
  return io;
}
