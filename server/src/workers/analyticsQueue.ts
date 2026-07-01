import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { prisma } from '../config/db';
import { analyticsService } from '../services/analyticsService';
import { cache } from '../lib/cache';



const hasRedis = !!process.env.REDIS_URL;
let redisConnection: any = null;
if (hasRedis) {
  redisConnection = new IORedis(process.env.REDIS_URL as string, { maxRetriesPerRequest: null });
} else {
  // Stub for missing Redis
  redisConnection = new (class { constructor(...args: any[]) {} on(...args: any[]) {} })();
}

class MockQueue {
  async add(name: string, data: any) {
    console.log(`[Mock Queue] Added job: ${name}`);
    // Immediately execute it for dev mode without Redis
    if (name === 'refresh-tenant-analytics') {
      await processAnalyticsJob({ name, data } as any);
    }
    return { id: 'stub' };
  }
}

export const analyticsQueue = hasRedis 
  ? new Queue('analytics', { 
      connection: redisConnection,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: true,
      }
    })
  : new MockQueue() as any;

async function processAnalyticsJob(job: Job) {
  console.log(`Processing analytics job ${job.id || 'stub'} of type ${job.name}`);
  
  if (job.name === 'refresh-all-analytics') {
    const tenants = await prisma.tenant.findMany({ select: { id: true } });
    for (const t of tenants) {
      await analyticsQueue.add('refresh-tenant-analytics', { tenantId: t.id }, { removeOnComplete: true });
    }
  }

  if (job.name === 'refresh-tenant-analytics') {
    const { tenantId } = job.data;
    
    // We will call getExecutiveDashboardMetrics which we'll build in Phase 2
    const aggregatedData = await analyticsService.getExecutiveDashboardMetrics(tenantId);

    const cacheKey = `tenant:${tenantId}:dashboard:aggregate`;
    await cache.set(cacheKey, aggregatedData, 3600);

    console.log(`Analytics refreshed successfully for tenant ${tenantId}`);
  }
}

let worker: any = null;
if (hasRedis) {
  worker = new Worker('analytics', processAnalyticsJob, { connection: redisConnection });
  worker.on('completed', (job: any) => {
    console.log(`Job ${job.id} (${job.name}) has completed!`);
  });
  worker.on('failed', (job: any, err: any) => {
    console.log(`Job ${job?.id} (${job?.name}) has failed with ${err.message}`);
  });
}

