/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { put } from '@vercel/blob';

import { config } from '@/task-runner/config/env';

type UploadFileFunction = (
  fileName: string,
  fileBuffer: Buffer
) => Promise<string>;

const s3 = new S3Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId || '',
    secretAccessKey: config.aws.secretAccessKey || '',
  },
  endpoint: config.aws.endpoint,
});

const uploadToVercelBlob: UploadFileFunction = async (
  fileName: string,
  fileBuffer: Buffer
) => {
  if (!config.vercel.blobReadWriteToken) {
    throw new Error('Vercel Blob Read/Write token is required');
  }

  const response = await put(fileName, fileBuffer, {
    token: config.vercel.blobReadWriteToken,
    access: 'public',
  });

  return response.downloadUrl;
};

const uploadToS3: UploadFileFunction = async (
  fileName: string,
  fileBuffer: Buffer
) => {
  const command = new PutObjectCommand({
    Bucket: config.storage.s3.bucketName,
    Key: fileName,
    Body: fileBuffer,
  });

  await s3.send(command);

  const downloadUrl = `https://${config.storage.s3.bucketName}.${config.aws.endpoint}/${fileName}`;

  return downloadUrl;
};

export const uploadFile: UploadFileFunction = async (
  fileName: string,
  fileBuffer: Buffer
) => {
  const fileStorageProvider = config.storage.provider;

  if (fileStorageProvider === 'aws') {
    return uploadToS3(fileName, fileBuffer);
  }
  if (fileStorageProvider === 'vercel') {
    return uploadToVercelBlob(fileName, fileBuffer);
  }
  throw new Error('Unsupported FILE_STORAGE_PROVIDER');
};
