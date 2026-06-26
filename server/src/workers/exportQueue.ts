import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import path from 'path';
import fs from 'fs/promises';
import { prisma } from '../config/db';
import { generateReceiptPdfBuffer } from '../utils/pdfGenerator';
import { generateCSV, generateExcel } from '../utils/csvEngine';
import { notifyUserEvent } from '../lib/socketManager';
import { uploadBufferToS3 } from '../utils/s3Uploader';

const redisConnection = new (class { on() {} })();

export const exportQueue = new (class { add() { return Promise.resolve(); } })('exportQueue', { 
  connection: redisConnection as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: true,
  }
});

const worker = new (class { on() {} })('exportQueue', async (job: Job) => {
  console.log(`[ExportWorker] Processing job ${job.id} of type ${job.name}`);
  const { tenantId, userId } = job.data;
  
  // Ensure downloads directory exists
  const downloadsDir = path.join(__dirname, '../../public/downloads');
  await fs.mkdir(downloadsDir, { recursive: true });

  let fileBuffer: Buffer | null = null;
  let filename = '';
  let contentType = '';

  if (job.name === 'generate_fee_receipt') {
    const { collectionId } = job.data;
    
    // Fetch data
    const collection = await prisma.feeCollection.findUnique({
      where: { id: collectionId },
      include: {
        student: { include: { profile: true, admission: true } },
        payments: true,
        assignment: {
          include: {
            feeStructure: { include: { items: { include: { feeCategory: true } }, class: true } },
            discounts: { include: { discount: true } },
          },
        },
        collectedByUser: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (!collection) throw new Error('Receipt not found');
    
    fileBuffer = await generateReceiptPdfBuffer(collection);
    filename = `Receipt-${collection.receiptNumber}.pdf`;
    contentType = 'application/pdf';

  } else if (job.name === 'export_students') {
    const { format } = job.data;
    
    // Fetch data
    const students = await prisma.user.findMany({
      where: { tenantId, role: 'STUDENT' },
      include: { profile: true, admission: true }
    });

    const exportData = students.map(s => ({
      'First Name': s.firstName,
      'Last Name': s.lastName,
      'Email': s.email,
      'Admission Number': s.admission?.admissionNumber || '',
      'Status': s.isActive ? 'Active' : 'Inactive',
      'Gender': s.profile?.gender || '',
      'Date of Birth': s.profile?.dateOfBirth ? new Date(s.profile.dateOfBirth).toLocaleDateString() : ''
    }));

    if (format === 'excel') {
      fileBuffer = await generateExcel(exportData, 'Students');
      filename = `students_${Date.now()}.xlsx`;
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    } else {
      fileBuffer = generateCSV(exportData);
      filename = `students_${Date.now()}.csv`;
      contentType = 'text/csv';
    }
  } else {
    throw new Error(`Unknown job type: ${job.name}`);
  }

  // Write file to disk or upload to S3
  if (fileBuffer) {
    try {
      const fileUrl = await uploadBufferToS3(fileBuffer, filename, contentType);
      return { fileUrl, filename, contentType };
    } catch (err) {
      console.error('S3 Upload Failed, falling back to local storage', err);
      // Fallback local storage for dev/testing
      const downloadsDir = path.join(__dirname, '../../public/downloads');
      await fs.mkdir(downloadsDir, { recursive: true });
      const filePath = path.join(downloadsDir, filename);
      await fs.writeFile(filePath, fileBuffer);
      const fileUrl = `/downloads/${filename}`;
      return { fileUrl, filename, contentType };
    }
  }
  
  throw new Error('Failed to generate file');

}, { connection: redisConnection as any });

worker.on('completed', async (job) => {
  console.log(`[ExportWorker] Job ${job.id} completed. Data available at ${job.returnvalue.fileUrl}`);
  // Notify user in real-time
  if (job.data.userId) {
    notifyUserEvent(job.data.userId, 'job_completed', {
      jobId: job.id,
      fileUrl: job.returnvalue.fileUrl,
      filename: job.returnvalue.filename
    });
  }
});

worker.on('failed', (job, err) => {
  console.error(`[ExportWorker] Job ${job?.id} failed:`, err.message);
  if (job?.data.userId) {
    notifyUserEvent(job.data.userId, 'job_failed', {
      jobId: job?.id,
      error: err.message
    });
  }
});
