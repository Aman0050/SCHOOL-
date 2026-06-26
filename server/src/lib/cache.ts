// Mocked CacheService to avoid Redis connection errors during local dev without Redis

class CacheService {
  constructor() {
    console.log('[Redis] CacheService mocked to prevent connection errors');
  }

  async get<T>(key: string): Promise<T | null> {
    return null;
  }

  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    // Mocked out
  }

  async invalidate(key: string): Promise<void> {
    // Mocked out
  }

  async invalidatePattern(pattern: string): Promise<void> {
    // Mocked out
  }

  async remember<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
    const freshData = await fetcher();
    return freshData;
  }
}

export const cache = new CacheService();
