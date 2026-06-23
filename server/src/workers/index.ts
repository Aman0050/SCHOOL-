import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';

const redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

// 1. Define Queues
export const emailQueue = new Queue('emailQueue', { connection: redisConnection as any });
export const reportQueue = new Queue('reportQueue', { connection: redisConnection as any });

// 2. Define Workers
export const emailWorker = new Worker(
  'emailQueue',
  async (job: Job) => {
    console.log(`Processing email job ${job.id} for ${job.data.to}`);
    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log(`Email sent to ${job.data.to}`);
  },
  { connection: redisConnection as any }
);

export const reportWorker = new Worker(
  'reportQueue',
  async (job: Job) => {
    console.log(`Generating report ${job.data.reportType} for tenant ${job.data.tenantId}`);
    // Simulate heavy report generation
    await new Promise((resolve) => setTimeout(resolve, 5000));
    console.log(`Report ${job.id} completed.`);
  },
  { connection: redisConnection as any }
);

// 3. Error Handling
emailWorker.on('failed', (job, err) => {
  console.error(`Email Job ${job?.id} failed:`, err);
});

reportWorker.on('failed', (job, err) => {
  console.error(`Report Job ${job?.id} failed:`, err);
});

console.log('Background workers initialized.');
