import type { Request, Response, NextFunction } from 'express';
import { z, type ZodSchema } from 'zod';
import { AppError } from './error.middleware';

export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((err: z.ZodIssue) => {
          const path = err.path.join('.');
          return `${path}: ${err.message}`;
        });
        throw new AppError(
          `Validation failed: ${errorMessages.join(', ')}`,
          400
        );
      }
      next(error);
    }
  };
};
