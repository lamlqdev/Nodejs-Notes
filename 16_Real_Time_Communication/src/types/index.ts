// ---- Socket.io typed event maps ----

export interface ServerToClientEvents {
  message_received: (msg: MessageData) => void;
  message_history: (msgs: MessageData[]) => void;
  user_joined: (data: { username: string; roomId: string }) => void;
  user_left: (data: { username: string; roomId: string }) => void;
  room_presence: (data: { roomId: string; onlineUsers: string[] }) => void;
}

export interface ClientToServerEvents {
  join_room: (data: { roomId: string; username: string }) => void;
  leave_room: (data: { roomId: string; username: string }) => void;
  send_message: (data: { roomId: string; username: string; content: string }) => void;
  typing_start: (data: { roomId: string; username: string }) => void;
  typing_stop: (data: { roomId: string; username: string }) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  username?: string;
  roomId?: string;
}

// ---- Domain types ----

export interface MessageData {
  id: string;
  roomId: string;
  username: string;
  content: string;
  createdAt: Date;
}

export interface RoomData {
  id: string;
  name: string;
  createdAt: Date;
}

// ---- SSE event types ----

export interface TypingEvent {
  username: string;
  isTyping: boolean;
}

export interface PresenceEvent {
  onlineUsers: string[];
}
