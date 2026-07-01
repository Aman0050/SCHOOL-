import { Redis } from 'ioredis';

class CacheService {
  private client: Redis | null = null;
  private memoryCache: Map<string, { value: any, expiresAt: number }> = new Map();

  constructor() {
    if (process.env.REDIS_URL) {
      this.client = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 1,
        retryStrategy: () => null // gracefully degrade if Redis goes down
      });
      this.client.on('error', (err) => {
        console.warn('[Redis] Connection error, falling back to memory cache:', err.message);
        this.client = null;
      });
      console.log('[Redis] Connected and ready');
    } else {
      console.log('[Redis] REDIS_URL not provided, falling back to memory cache');
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.client) {
      try {
        const data = await this.client.get(key);
        return data ? JSON.parse(data) : null;
      } catch (e) {
        return null;
      }
    }
    
    // Memory Cache Fallback
    const cached = this.memoryCache.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }
    return cached.value;
  }

  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    if (this.client) {
      try {
        await this.client.setex(key, ttlSeconds, JSON.stringify(value));
      } catch (e) {}
      return;
    }
    
    // Memory Cache Fallback
    this.memoryCache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000
    });
  }

  async invalidate(key: string): Promise<void> {
    if (this.client) {
      try {
        await this.client.del(key);
      } catch (e) {}
      return;
    }
    
    // Memory Cache Fallback
    this.memoryCache.delete(key);
  }

  async invalidatePattern(pattern: string): Promise<void> {
    if (this.client) {
      try {
        const keys = await this.client.keys(pattern);
        if (keys.length > 0) {
          await this.client.del(...keys);
        }
      } catch (e) {}
      return;
    }

    // Memory Cache Fallback
    // Note: Simple prefix-based approximation for local map
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(pattern.replace('*', ''))) {
        this.memoryCache.delete(key);
      }
    }
  }

  async remember<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached) return cached;
    
    const freshData = await fetcher();
    await this.set(key, freshData, ttlSeconds);
    return freshData;
  }
}

export const cache = new CacheService();
