import Redis from 'ioredis';

// Use a local redis instance for development if REDIS_URL is not provided
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redis.on('connect', () => {
  console.log('Successfully connected to Redis');
});

/**
 * Utility to get or set cache
 */
export async function getOrSetCache<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
  try {
    const cachedData = await redis.get(key);
    if (cachedData) {
      return JSON.parse(cachedData) as T;
    }

    const freshData = await fetcher();
    
    if (freshData) {
      await redis.setex(key, ttlSeconds, JSON.stringify(freshData));
    }
    
    return freshData;
  } catch (error) {
    console.error(`Cache Error for key ${key}:`, error);
    // Fallback to fetcher if redis fails
    return await fetcher();
  }
}

export async function invalidateCachePattern(pattern: string) {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error(`Cache Invalidation Error for pattern ${pattern}:`, error);
  }
}
