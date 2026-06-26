// Mocked redis
export const redis = {
  on: () => {},
  get: async () => null,
  setex: async () => {},
  scanStream: () => ({ on: () => {} }),
  pipeline: () => ({ del: () => {}, exec: () => {} })
} as any;

export async function getOrSetCache<T>(key: string, ttl: number, fetcher: () => Promise<T>): Promise<T> {
  return await fetcher();
}

export async function clearCachePattern(pattern: string) {
  // Mock
}
