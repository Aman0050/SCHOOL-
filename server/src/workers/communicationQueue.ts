import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { prisma } from '../config/db';

const redisConnection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const communicationQueue = new Queue('communication', { connection: redisConnection as any });

const worker = new Worker('communication', async (job: Job) => {
  const { logId, channel, target, content } = job.data;
  
  console.log(`[Communication Engine] Processing message ID ${logId} via ${channel} to ${target}`);
  
  try {
    // 1. Simulate sending message via external provider (Twilio, SendGrid, WhatsApp API)
    await new Promise((resolve) => setTimeout(resolve, 500)); // Mock network delay
    
    // Simulate rare failure
    if (Math.random() > 0.95) {
      throw new Error(`Provider timeout on channel ${channel}`);
    }

    // 2. Mark as sent in Database
    await prisma.communicationLog.update({
      where: { id: logId },
      data: {
        status: 'SENT',
        sentAt: new Date(),
        providerId: `MOCK_PROVIDER_${Date.now()}`
      }
    });

    console.log(`[Communication Engine] ✅ Message ${logId} sent successfully.`);
    return { success: true, logId };

  } catch (error: any) {
    console.error(`[Communication Engine] ❌ Failed to send message ${logId}:`, error.message);
    
    // 3. Mark as failed in Database
    await prisma.communicationLog.update({
      where: { id: logId },
      data: {
        status: 'FAILED',
        errorReason: error.message
      }
    });

    throw error; // Will trigger BullMQ retry logic if configured
  }
}, { connection: redisConnection as any });

worker.on('failed', (job, err) => {
  console.log(`[Communication Engine] Job ${job?.id} has failed permanently after retries.`);
});
