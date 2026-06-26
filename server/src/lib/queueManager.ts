import { logger } from '../utils/logger';

// Default redis connection, adjust as per env
const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

// Mock Queue class to avoid Redis connection issues during local dev without Redis
class MockQueue {
  name: string;
  constructor(name: string, options: any) {
    this.name = name;
  }
  add(name: string, data: any, opts?: any) {
    logger.info(`[MockQueue] Added job ${name} to queue ${this.name}`);
    return Promise.resolve();
  }
}

export const integrityQueue = new MockQueue('integrity-checks', {}) as any;
export const searchQueue = new MockQueue('search-sync', {}) as any;

export const initQueues = () => {
  logger.info('[Queue] BullMQ mocked out to prevent Redis connection errors during dev.');
};
