import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

class CacheService {
  private client: Redis;

    this.client = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableOfflineQueue: false,
      retryStrategy: (times) => Math.min(times * 50, 2000)
    });

    this.client.on('error', (err) => {
      console.error('[Redis Error]', err);
    });

    this.client.on('connect', () => {
      console.log('[Redis] Connected to cache cluster');
    });
  }

  /**
   * Get item from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.client.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (err) {
      console.error(`[Redis Get Error] ${key}:`, err);
      return null;
    }
  }

  /**
   * Set item in cache with TTL (in seconds)
   * Default TTL is 1 hour
   */
  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    try {
      await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (err) {
      console.error(`[Redis Set Error] ${key}:`, err);
    }
  }

  /**
   * Delete item from cache
   */
  async invalidate(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (err) {
      console.error(`[Redis Invalidate Error] ${key}:`, err);
    }
  }

  /**
   * Invalidate all keys matching a pattern (e.g. 'tenant:123:*')
   */
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (err) {
      console.error(`[Redis Invalidate Pattern Error] ${pattern}:`, err);
    }
  }

  /**
   * Factory method to try fetching from cache first, then run fallback function
   */
  async remember<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached) return cached;

    const freshData = await fetcher();
    await this.set(key, freshData, ttlSeconds);
    return freshData;
  }
}

export const cache = new CacheService();
