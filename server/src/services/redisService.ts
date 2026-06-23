import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
export const redis = new Redis(REDIS_URL);

redis.on('connect', () => console.log('🟢 Redis connected'));
redis.on('error', (err) => console.error('🔴 Redis error:', err));

/**
 * Get cached data or execute callback to fetch and cache it
 * @param key Cache key
 * @param ttl Time to live in seconds
 * @param fetcher Async function to fetch data if cache misses
 */
export async function getOrSetCache<T>(key: string, ttl: number, fetcher: () => Promise<T>): Promise<T> {
  try {
    const cachedData = await redis.get(key);
    if (cachedData) {
      return JSON.parse(cachedData) as T;
    }
  } catch (err) {
    console.error('Redis GET error:', err);
  }

  const freshData = await fetcher();

  try {
    await redis.setex(key, ttl, JSON.stringify(freshData));
  } catch (err) {
    console.error('Redis SET error:', err);
  }

  return freshData;
}

export async function clearCachePattern(pattern: string) {
  try {
    const stream = redis.scanStream({ match: pattern });
    stream.on('data', async (keys: string[]) => {
      if (keys.length) {
        const pipeline = redis.pipeline();
        keys.forEach((key) => pipeline.del(key));
        await pipeline.exec();
      }
    });
  } catch (err) {
    console.error('Redis CLEAR error:', err);
  }
}
