import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { prisma } from '../config/db';
import { analyticsService } from '../services/analyticsService';
import { cache } from '../lib/cache';

const redisConnection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const analyticsQueue = new Queue('analytics', { 
  connection: redisConnection as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: true,
  }
});

const worker = new Worker('analytics', async (job: Job) => {
  console.log(`Processing analytics job ${job.id} of type ${job.name}`);
  
  if (job.name === 'refresh-all-analytics') {
    const tenants = await prisma.tenant.findMany({ select: { id: true } });
    for (const t of tenants) {
      await analyticsQueue.add('refresh-tenant-analytics', { tenantId: t.id }, { removeOnComplete: true });
    }
  }

  if (job.name === 'refresh-tenant-analytics') {
    const { tenantId } = job.data;
    const attData = await analyticsService.getAttendanceIntelligence(tenantId);
    const feeData = await analyticsService.getFeeIntelligence(tenantId);
    const healthData = await analyticsService.getSchoolHealthScore(tenantId);
    const alertData = await analyticsService.getSystemAlerts(tenantId);

    const aggregatedData = {
      attendance: attData,
      fees: feeData,
      health: healthData,
      alerts: alertData
    };

    const cacheKey = `tenant:${tenantId}:dashboard:aggregate`;
    await cache.set(cacheKey, aggregatedData, 3600);
    
    // Also set individual keys if needed
    await cache.set(`tenant:${tenantId}:attendance`, attData, 3600);
    await cache.set(`tenant:${tenantId}:fees`, feeData, 3600);
    await cache.set(`tenant:${tenantId}:health-score`, healthData, 3600);

    console.log(`Analytics refreshed successfully for tenant ${tenantId}`);
  }

  if (job.name === 'calculate-health-score') {
    const { tenantId, schoolId } = job.data;
    console.log(`Health score calculated for school ${schoolId} (tenant: ${tenantId})`);
  }
  
  if (job.name === 'detect-risk') {
    const { tenantId, studentId } = job.data;
  }
}, { connection: redisConnection as any });

worker.on('completed', (job) => {
  console.log(`Job ${job.id} (${job.name}) has completed!`);
});

worker.on('failed', (job, err) => {
  console.log(`Job ${job?.id} (${job?.name}) has failed with ${err.message}`);
});
