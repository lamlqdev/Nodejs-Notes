import type { Request, Response, NextFunction } from 'express';
import { sseManager } from '../sse/manager';
import { getOnlineUsers } from '../socket/index';
import { prisma } from '../prisma/client';
import { AppError } from '../middlewares/error.middleware';
import logger from '../utils/logger.util';

export async function sseController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const roomId = req.params.id as string;

    // Verify room exists before opening stream
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) throw new AppError('Room not found', 404);

    // ── SSE handshake headers ──────────────────────────────────────────
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    // Allow browser EventSource to reconnect through proxies
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    // Register this response object with the SSE manager
    sseManager.addClient(roomId, res);

    // Push current presence immediately so the client has initial state
    const initialPresence = getOnlineUsers(roomId);
    res.write(`event: presence\ndata: ${JSON.stringify({ onlineUsers: initialPresence })}\n\n`);

    // Keepalive comment every 30s — prevents proxies/load-balancers from
    // closing idle connections. SSE comment lines start with ":"
    const keepaliveTimer = setInterval(() => {
      try {
        res.write(': keepalive\n\n');
      } catch {
        clearInterval(keepaliveTimer);
      }
    }, 30_000);

    // ── Cleanup on client disconnect ───────────────────────────────────
    req.on('close', () => {
      clearInterval(keepaliveTimer);
      sseManager.removeClient(roomId, res);
      logger.info('SSE connection closed by client', { roomId });
    });
  } catch (err) {
    next(err);
  }
}
