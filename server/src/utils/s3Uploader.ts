import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'dummy-access-key',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'dummy-secret-key',
  },
});

export const uploadBufferToS3 = async (
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> => {
  const bucketName = process.env.AWS_S3_BUCKET || 'eduxeno-assets-prod';
  
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: filename,
    Body: buffer,
    ContentType: contentType,
  });

  await s3Client.send(command);

  // Generate a signed URL valid for 1 hour
  // If using CloudFront, you'd replace this logic with CloudFront signing
  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  
  return signedUrl;
};
