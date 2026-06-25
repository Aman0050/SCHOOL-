import { Queue, Worker } from 'bullmq';
import { integrityEngine } from '../services/integrityEngine';
import { prisma } from '../config/db';
import { logger } from '../utils/logger';

// Default redis connection, adjust as per env
const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

export const integrityQueue = new Queue('integrity-checks', { 
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: true,
  }
});

export const searchQueue = new Queue('search-sync', {
  connection,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: true,
  }
});

// Initialize the worker that processes the queue
import '../workers/exportQueue';
import '../workers/communicationQueue';
import { analyticsQueue } from '../workers/analyticsQueue';
import '../workers/searchSyncQueue';
import { superAdminQueue } from '../workers/superAdminQueue';

export const initQueues = () => {
  const worker = new Worker(
    'integrity-checks',
    async (job) => {
      if (job.name === 'daily-scan') {
        logger.info('[Queue] Starting Daily Integrity Scan across all tenants');
        const tenants = await prisma.tenant.findMany({ select: { id: true } });
        for (const t of tenants) {
          await integrityEngine.runFastScan(t.id);
        }
        logger.info('[Queue] Completed Daily Integrity Scan');
      }
    },
    { connection }
  );

  worker.on('failed', (job, err) => {
    logger.error(`[Queue] Job ${job?.id} failed:`, err);
  });

  // Schedule the recurring job
  // Runs every day at 2:00 AM server time
  integrityQueue.add('daily-scan', {}, {
    repeat: {
      pattern: '0 2 * * *',
    },
  });

  // Schedule analytics precomputation every 5 minutes
  analyticsQueue.add('refresh-all-analytics', {}, {
    repeat: {
      pattern: '*/5 * * * *',
    },
  });

  // Schedule the Super Admin dashboard aggregation every 5 minutes
  superAdminQueue.add('aggregate-dashboard', {}, {
    repeat: {
      pattern: '*/5 * * * *',
    }
  });
  
  // Kick off an initial aggregation on startup
  superAdminQueue.add('aggregate-dashboard', {});

  logger.info('[Queue] BullMQ initialized and cron jobs scheduled.');
};
