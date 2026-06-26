import { Worker } from 'bullmq';
import { searchClient } from '../lib/searchClient';
import { logger } from '../utils/logger';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

export const searchSyncWorker = new (class { on() {} })(
  'search-sync',
  async (job) => {
    const { entity, operation, payload, id } = job.data;

    try {
      if (operation === 'delete') {
        await searchClient.delete({
          index: entity,
          id: id,
        });
        logger.info(`[SearchSync] Deleted ${entity} ${id}`);
        return;
      }

      // For create / update
      await searchClient.index({
        index: entity,
        id: id,
        body: payload,
      });
      logger.info(`[SearchSync] Indexed ${entity} ${id}`);

    } catch (error) {
      logger.error(`[SearchSync] Failed to sync ${entity} ${id}`, error);
      throw error;
    }
  },
  { connection }
);

searchSyncWorker.on('failed', (job, err) => {
  logger.error(`[SearchSync] Job ${job?.id} failed:`, err);
});
