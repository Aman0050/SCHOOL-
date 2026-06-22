import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

interface RateLimitStore {
  [ip: string]: RateLimitRecord;
}

const stores: { [prefix: string]: RateLimitStore } = {};

export const rateLimiter = (options: {
  windowMs: number;
  max: number;
  message?: string;
  keyPrefix?: string;
}) => {
  const prefix = options.keyPrefix || 'global';
  
  if (!stores[prefix]) {
    stores[prefix] = {};
  }
  
  const store = stores[prefix];

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || 'unknown-ip';
    const now = Date.now();

    if (!store[ip]) {
      store[ip] = {
        count: 1,
        resetTime: now + options.windowMs,
      };
      return next();
    }

    const record = store[ip];

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + options.windowMs;
      return next();
    }

    record.count++;
    
    if (record.count > options.max) {
      const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', String(retryAfterSeconds));
      return next(
        new AppError(
          429,
          'TOO_MANY_REQUESTS',
          options.message || 'Too many requests. Please slow down and try again later.',
          { retryAfterSeconds }
        )
      );
    }

    next();
  };
};

export default rateLimiter;
