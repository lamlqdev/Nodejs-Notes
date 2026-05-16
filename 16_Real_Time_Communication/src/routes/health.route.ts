import { Router } from 'express';
import type { Request, Response } from 'express';
import { prisma } from '../prisma/client';
import { sseManager } from '../sse/manager';
import logger from '../utils/logger.util';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const status = { database: 'unknown', sseClients: 0 };

  try {
    await prisma.$queryRaw`SELECT 1`;
    status.database = 'ok';
  } catch {
    status.database = 'error';
  }

  status.sseClients = sseManager.clientCount();

  const allOk = status.database === 'ok';
  const httpStatus = allOk ? 200 : 503;

  if (!allOk) logger.warn('Health check failed', status);

  res.status(httpStatus).json({ success: allOk, message: 'Health check', data: status });
});

export default router;
