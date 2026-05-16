import app from './app';
import config from './config/config';
import { startWorkers, stopWorkers } from './workers/email.worker';
import { startCronJobs, stopCronJobs } from './crons/index';
import { redisConnection } from './queues/redis.connection';
import { prisma } from './prisma/client';
import { emailQueue } from './queues/email.queue';
import logger from './utils/logger.util';

const server = app.listen(config.port, () => {
  logger.info('Server started', {
    port: config.port,
    environment: config.nodeEnv,
    apiDocs: `http://localhost:${config.port}/api-docs`,
  });

  startWorkers();
  startCronJobs();
});

async function gracefulShutdown(signal: string): Promise<void> {
  logger.info(`Received ${signal}, shutting down gracefully`);

  server.close(async () => {
    try {
      stopCronJobs();
      await stopWorkers();
      await emailQueue.close();
      await redisConnection.quit();
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
