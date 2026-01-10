import type { Request, Response, NextFunction } from 'express';
import { z, type ZodSchema } from 'zod';
import { AppError } from './error.middleware';

/**
 * Generic validation middleware factory
 * Validates request data (body, query, params) against a Zod schema
 *
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 *
 * @example
 * ```ts
 * // In routes file:
 * router.post(
 *   '/',
 *   validate(createProductSchema),
 *   createProductController
 * );
 * ```
 */
export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate the entire request object against the schema
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      next();
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        // Format Zod validation errors into a readable message
        const errorMessages = error.errors.map((err: z.ZodIssue) => {
          const path = err.path.join('.');
          return `${path}: ${err.message}`;
        });

        throw new AppError(
          `Validation failed: ${errorMessages.join(', ')}`,
          400
        );
      }

      // If it's not a Zod error, pass it to error handler
      next(error);
    }
  };
};

/**
 * Generic middleware to validate MongoDB ObjectId in params
 * Can be used for any route that has :id parameter
 *
 * @param paramName - Name of the parameter (default: 'id')
 * @returns Express middleware function
 */
export const validateObjectId = (paramName: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[paramName];

    // MongoDB ObjectId validation (24 hex characters)
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;

    if (!id || !objectIdRegex.test(id)) {
      throw new AppError(`Invalid ${paramName} format`, 400);
    }

    next();
  };
};

/**
 * Helper function to validate only request body
 * Useful for validating body separately from params/query
 */
export const validateBody = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
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

/**
 * Helper function to validate only query parameters
 */
export const validateQuery = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = await schema.parseAsync(req.query);
      next();
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((err: z.ZodIssue) => {
          const path = err.path.join('.');
          return `${path}: ${err.message}`;
        });

        throw new AppError(
          `Query validation failed: ${errorMessages.join(', ')}`,
          400
        );
      }
      next(error);
    }
  };
};
