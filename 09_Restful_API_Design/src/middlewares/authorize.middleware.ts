import type { Request, Response, NextFunction } from 'express';
import { AppError } from './error.middleware';

export const authorizeAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  if (req.user.role !== 'admin') {
    throw new AppError('Access denied. Admin privileges required', 403);
  }

  next();
};

export const authorizeRoles = (...roles: Array<'admin' | 'user'>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError('Access denied. Insufficient privileges', 403);
    }

    next();
  };
};
