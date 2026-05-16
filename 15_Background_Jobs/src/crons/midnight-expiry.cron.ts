import cron from 'node-cron';
import { prisma } from '../prisma/client';
import logger from '../utils/logger.util';

// Runs at 00:00 every day — marks job postings past their expiresAt as EXPIRED
export function scheduleMidnightExpiry(): cron.ScheduledTask {
  return cron.schedule('0 0 * * *', async () => {
    logger.info('Cron: midnight-expiry starting');
    try {
      const result = await prisma.jobPosting.updateMany({
        where: {
          status: 'ACTIVE',
          expiresAt: { lt: new Date() },
        },
        data: { status: 'EXPIRED' },
      });
      logger.info('Cron: midnight-expiry completed', { expiredCount: result.count });
    } catch (err) {
      logger.error('Cron: midnight-expiry failed', { error: (err as Error).message });
    }
  });
}
