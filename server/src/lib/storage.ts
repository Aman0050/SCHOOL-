import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'auto',
  endpoint: process.env.S3_ENDPOINT, // e.g. https://<account_id>.r2.cloudflarestorage.com
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  // Needed for S3-compatible services like Cloudflare R2 or MinIO
  forcePathStyle: true, 
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'eduxeno-storage';

export const storageService = {
  /**
   * Generates a pre-signed URL for direct browser uploads.
   * This prevents large files from passing through our Node.js API cluster.
   */
  async getUploadUrl(fileName: string, contentType: string, tenantId: string): Promise<{ uploadUrl: string; key: string }> {
    const key = `tenants/${tenantId}/${Date.now()}-${fileName}`;
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // Valid for 1 hour
    return { uploadUrl, key };
  },

  /**
   * Generates a secure read-only URL for private files
   */
  async getDownloadUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  }
};
