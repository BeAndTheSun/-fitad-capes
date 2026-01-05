import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { put } from '@vercel/blob';
import { awsCredentialsProvider } from '@vercel/functions/oidc';

import { config } from '@/task-runner/config/env';

type UploadZipFileFunction = (
  zipFileName: string,
  zipBuffer: Buffer
) => Promise<string>;

const s3 = new S3Client({
  region: config.aws.region,
  endpoint: config.aws.endpoint,
  credentials: process.env.AWS_ROLE_ARN
    ? awsCredentialsProvider({ roleArn: process.env.AWS_ROLE_ARN })
    : undefined,
});

const uploadToVercelBlob: UploadZipFileFunction = async (
  zipFileName: string,
  zipBuffer: Buffer
) => {
  if (!config.vercel.blobReadWriteToken) {
    throw new Error('Vercel Blob Read/Write token is required');
  }

  const response = await put(zipFileName, zipBuffer, {
    token: config.vercel.blobReadWriteToken,
    access: 'public',
  });

  return response.downloadUrl;
};

const uploadToS3: UploadZipFileFunction = async (
  zipFileName: string,
  zipBuffer: Buffer
) => {
  const command = new PutObjectCommand({
    Bucket: config.storage.s3.bucketName,
    Key: zipFileName,
    Body: zipBuffer,
  });

  await s3.send(command);

  const downloadUrl = `https://${config.storage.s3.bucketName}.${config.aws.endpoint}/${zipFileName}`;

  return downloadUrl;
};

export const uploadZip: UploadZipFileFunction = async (
  zipFileName: string,
  zipBuffer: Buffer
) => {
  const fileStorageProvider = config.storage.provider;

  if (fileStorageProvider === 'aws') {
    return uploadToS3(zipFileName, zipBuffer);
  }
  if (fileStorageProvider === 'vercel') {
    return uploadToVercelBlob(zipFileName, zipBuffer);
  }
  throw new Error('Unsupported FILE_STORAGE_PROVIDER');
};
