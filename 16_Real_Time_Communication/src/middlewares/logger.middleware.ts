import type { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger.util';

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${Date.now() - start}ms`,
      ip: req.ip,
    };
    if (res.statusCode >= 500) logger.error('HTTP Request Error', logData);
    else if (res.statusCode >= 400) logger.warn('HTTP Request Warning', logData);
    else logger.info('HTTP Request', logData);
  });
  next();
};
