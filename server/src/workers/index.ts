import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';

const redisConnection = new (class { constructor(...args: any[]) {} on(...args: any[]) {} })();

// 1. Define Queues
export const emailQueue = new (class {
  constructor(...args: any[]) {}
  add(...args: any[]) { return Promise.resolve({ id: 'stub' }); }
})('emailQueue', { connection: redisConnection as any });

export const reportQueue = new (class {
  constructor(...args: any[]) {}
  add(...args: any[]) { return Promise.resolve({ id: 'stub' }); }
})('reportQueue', { connection: redisConnection as any });

// 2. Define Workers
export const emailWorker = new (class { constructor(...args: any[]) {} on(...args: any[]) {} })(
  'emailQueue',
  async (job: Job) => {
    console.log(`Processing email job ${job.id} for ${job.data.to}`);
    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log(`Email sent to ${job.data.to}`);
  },
  { connection: redisConnection as any }
);

export const reportWorker = new (class { constructor(...args: any[]) {} on(...args: any[]) {} })(
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
emailWorker.on('failed', (job: any, err: any) => {
  console.error(`Email Job ${job?.id} failed:`, err);
});

reportWorker.on('failed', (job: any, err: any) => {
  console.error(`Report Job ${job?.id} failed:`, err);
});

console.log('Background workers initialized.');
