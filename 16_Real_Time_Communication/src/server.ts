import http from 'http';
import app from './app';
import config from './config/config';
import { initSocket } from './socket/index';
import { sseManager } from './sse/manager';
import { prisma } from './prisma/client';
import logger from './utils/logger.util';

// Create HTTP server manually so Socket.io can attach to it
const server = http.createServer(app);

// Attach Socket.io to the same HTTP server
initSocket(server);

server.listen(config.port, () => {
  logger.info('Server started', {
    port: config.port,
    environment: config.nodeEnv,
    apiDocs: `http://localhost:${config.port}/api-docs`,
    socketIO: 'ws://localhost:' + config.port,
  });
});

async function gracefulShutdown(signal: string): Promise<void> {
  logger.info(`Received ${signal}, shutting down gracefully`);

  // 1. Stop accepting new HTTP connections
  server.close(async () => {
    try {
      // 2. Close all active SSE streams
      sseManager.closeAll();

      // 3. Disconnect Prisma
      await prisma.$disconnect();

      logger.info('Graceful shutdown complete');
      process.exit(0);
    } catch (err) {
      logger.error('Error during shutdown', { error: (err as Error).message });
      process.exit(1);
    }
  });
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
