import { Router } from 'express';
import type { Request, Response } from 'express';
import { redisConnection } from '../queues/redis.connection';
import { prisma } from '../prisma/client';
import logger from '../utils/logger.util';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const status = { redis: 'unknown', database: 'unknown' };

  try {
    await redisConnection.ping();
    status.redis = 'ok';
  } catch {
    status.redis = 'error';
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    status.database = 'ok';
  } catch {
    status.database = 'error';
  }

  const allOk = status.redis === 'ok' && status.database === 'ok';
  const httpStatus = allOk ? 200 : 503;

  if (!allOk) logger.warn('Health check failed', status);

  res.status(httpStatus).json({ success: allOk, message: 'Health check', data: status });
});

export default router;
