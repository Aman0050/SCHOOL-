import { Queue, Worker } from 'bullmq';
import { integrityEngine } from '../services/integrityEngine';
import { prisma } from '../config/db';
import { logger } from '../utils/logger';

// Default redis connection, adjust as per env
const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

export const integrityQueue = new Queue('integrity-checks', { connection });

// Initialize the worker that processes the queue
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

  logger.info('[Queue] BullMQ initialized and cron jobs scheduled.');
};
