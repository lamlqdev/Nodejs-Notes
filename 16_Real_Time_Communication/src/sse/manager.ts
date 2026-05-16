import type { Response } from 'express';
import logger from '../utils/logger.util';

/**
 * SSEManager — singleton that tracks all active SSE client connections
 * grouped by roomId. Used to push typing indicators and presence events
 * to browser clients without a full WebSocket connection.
 */
class SSEManager {
  // roomId → Set of active Response streams
  private clients = new Map<string, Set<Response>>();

  addClient(roomId: string, res: Response): void {
    if (!this.clients.has(roomId)) {
      this.clients.set(roomId, new Set());
    }
    this.clients.get(roomId)!.add(res);
    logger.info('SSE client connected', { roomId, total: this.clients.get(roomId)!.size });
  }

  removeClient(roomId: string, res: Response): void {
    this.clients.get(roomId)?.delete(res);
    logger.info('SSE client disconnected', { roomId, remaining: this.clients.get(roomId)?.size ?? 0 });
  }

  /**
   * Push an SSE event to every client in a room.
   * SSE wire format:
   *   event: <eventName>\n
   *   data: <JSON>\n
   *   \n
   */
  broadcast(roomId: string, event: string, data: unknown): void {
    const roomClients = this.clients.get(roomId);
    if (!roomClients || roomClients.size === 0) return;

    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    roomClients.forEach((res) => {
      try {
        res.write(payload);
      } catch {
        // Client already gone — will be cleaned up on 'close'
      }
    });
  }

  /** Called on graceful shutdown — terminates all open SSE streams. */
  closeAll(): void {
    this.clients.forEach((clients, roomId) => {
      clients.forEach((res) => {
        try { res.end(); } catch { /* ignore */ }
      });
      logger.info('SSE room closed', { roomId, count: clients.size });
    });
    this.clients.clear();
  }

  clientCount(): number {
    let total = 0;
    this.clients.forEach((c) => (total += c.size));
    return total;
  }
}

// Singleton — shared across the whole application
export const sseManager = new SSEManager();
