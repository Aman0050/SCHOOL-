// Mocked redis to prevent ECONNREFUSED spam
class MockRedis {
  on(event: string, cb: any) {}
  async get(key: string) { return null; }
  async setex(key: string, ttl: number, val: string) {}
  async keys(pattern: string) { return []; }
  async del(...keys: string[]) {}
}

export const redis = new MockRedis() as any;

export async function getOrSetCache<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
  return await fetcher();
}

export async function invalidateCachePattern(pattern: string) {
  // Do nothing
}
