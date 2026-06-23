import Redis from 'ioredis';
import { Request, Response, NextFunction } from 'express';

// Ensure the REDIS_URL exists or default to localhost
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

redis.on('error', (err) => {
  console.warn('Redis is currently unreachable. Caching will be bypassed.');
});

/**
 * Cache middleware to intercept responses and serve from Redis if available.
 * Usage: router.get('/stats', cacheMiddleware(300), getStats);
 * @param durationSeconds Time to live in seconds
 */
export const cacheMiddleware = (durationSeconds: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key based on URL and tenant context
    const tenantId = (req as any).tenant?.id || 'public';
    const key = `cache:${tenantId}:${req.originalUrl || req.url}`;

    try {
      if (redis.status !== 'ready') {
        return next();
      }
      const cachedData = await redis.get(key);
      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }

      // Intercept res.json to cache the outgoing response
      const originalJson = res.json;
      res.json = function (body) {
        // Cache the response asynchronously if status code is 200
        if (res.statusCode === 200) {
          redis.setex(key, durationSeconds, JSON.stringify(body)).catch(console.error);
        }
        return originalJson.call(this, body);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

/**
 * Utility to invalidate cache by pattern.
 * Call this when mutating data (e.g., POST/PUT/DELETE).
 */
export const invalidateCache = async (pattern: string) => {
  try {
    if (redis.status !== 'ready') return;
    const stream = redis.scanStream({
      match: `*${pattern}*`,
      count: 100,
    });

    stream.on('data', (keys: string[]) => {
      if (keys.length) {
        const pipeline = redis.pipeline();
        keys.forEach((key) => pipeline.del(key));
        pipeline.exec();
      }
    });
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
};
