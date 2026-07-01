import { Request, Response, NextFunction } from 'express';
import { Schema } from 'zod';
import { ValidationError } from '../errors/AppError';

export const validateBody = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(new ValidationError('Validation failed', result.error.format()));
    }
    req.body = result.data;
    next();
  };
};

export const validateQuery = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return next(new ValidationError('Invalid query parameters', result.error.format()));
    }
    req.query = result.data;
    next();
  };
};
