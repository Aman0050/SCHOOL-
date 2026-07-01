class MockRedis {
  private cache = new Map<string, { value: string; expiresAt: number }>();

  on(event: string, cb: any) {}
  
  async get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }
  
  async setex(key: string, ttlSeconds: number, val: string) {
    this.cache.set(key, { value: val, expiresAt: Date.now() + ttlSeconds * 1000 });
  }
  
  async keys(pattern: string) {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    const matchedKeys = [];
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        matchedKeys.push(key);
      }
    }
    return matchedKeys;
  }
  
  async del(...keys: string[]) {
    keys.forEach(key => this.cache.delete(key));
  }
}

export const redis = new MockRedis() as any;

export async function getOrSetCache<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
  const cached = await redis.get(key);
  if (cached) {
    try {
      return JSON.parse(cached) as T;
    } catch (e) {
      console.error('Redis cache parse error:', e);
    }
  }

  const freshData = await fetcher();
  await redis.setex(key, ttlSeconds, JSON.stringify(freshData));
  return freshData;
}

export async function invalidateCachePattern(pattern: string) {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
