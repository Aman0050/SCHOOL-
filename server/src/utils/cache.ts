import { Request, Response, NextFunction } from 'express';

// Mocked redis
export const redis = {
  status: 'error',
  on: () => {},
  get: async () => null,
  setex: async () => {},
  scanStream: () => ({ on: () => {} }),
  pipeline: () => ({ del: () => {}, exec: () => {} })
} as any;

export const cacheMiddleware = (durationSeconds: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    next();
  };
};

export const invalidateCache = async (pattern: string) => {
  // Mock
};
