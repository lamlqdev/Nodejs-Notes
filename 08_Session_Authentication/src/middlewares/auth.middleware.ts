import type { Request, Response, NextFunction } from 'express';
import { AppError } from './error.middleware';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Check if session exists and is authenticated
  if (!req.session || !req.session.isAuthenticated) {
    throw new AppError('Not authenticated', 401);
  }

  // Session data is already in req.session
  req.user = {
    userId: req.session.userId as string,
    email: req.session.email as string,
  };

  next();
};

