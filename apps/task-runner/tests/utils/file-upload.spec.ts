import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { put } from '@vercel/blob';
import { mockClient } from 'aws-sdk-client-mock';

import { config } from '@/task-runner/config/env';
import { uploadFile } from '@/task-runner/utils/file-upload-util';

const s3Mock = mockClient(S3Client);

jest.mock('@vercel/blob');

describe('uploadFile', () => {
  const zipFileName = 'test.zip';
  const zipBuffer = Buffer.from('test data');

  beforeEach(() => {
    jest.clearAllMocks();
    s3Mock.reset();
    config.storage.provider = 'unsupported';
  });

  it('should upload to S3 and return the download URL', async () => {
    config.storage.provider = 'aws';
    config.storage.s3.bucketName = 'test-bucket';
    config.aws.endpoint = 's3.amazonaws.com';

    s3Mock.on(PutObjectCommand).resolves({}); // Simulate a successful upload

    const downloadUrl = await uploadFile(zipFileName, zipBuffer);

    expect(s3Mock.calls()).toHaveLength(1);
    expect(downloadUrl).toBe(
      `https://test-bucket.s3.amazonaws.com/${zipFileName}`
    );
  });

  it('should upload to Vercel Blob and return the download URL', async () => {
    config.storage.provider = 'vercel';
    config.vercel.blobReadWriteToken = 'vercel-token';

    (put as jest.Mock).mockResolvedValueOnce({
      downloadUrl: 'https://vercel.com/test.zip',
    });

    const downloadUrl = await uploadFile(zipFileName, zipBuffer);

    expect(put).toHaveBeenCalledTimes(1);
    expect(put).toHaveBeenCalledWith(zipFileName, zipBuffer, {
      token: 'vercel-token',
      access: 'public',
    });
    expect(downloadUrl).toBe('https://vercel.com/test.zip');
  });

  it('should throw an error for unsupported storage provider', async () => {
    config.storage.provider = 'unsupported';

    await expect(uploadFile(zipFileName, zipBuffer)).rejects.toThrow(
      'Unsupported FILE_STORAGE_PROVIDER'
    );
  });

  it('should throw an error if S3 client is not initialized', async () => {
    config.storage.provider = 'aws';

    // Simulate S3 client not being initialized
    s3Mock
      .on(PutObjectCommand)
      .rejects(new Error('S3 client is not initialized.'));

    await expect(uploadFile(zipFileName, zipBuffer)).rejects.toThrow(
      'S3 client is not initialized.'
    );
  });

  it('should throw an error if BLOB_READ_WRITE_TOKEN is missing for Vercel', async () => {
    config.storage.provider = 'vercel';
    config.vercel.blobReadWriteToken = '';

    await expect(uploadFile(zipFileName, zipBuffer)).rejects.toThrow(
      'Vercel Blob Read/Write token is required'
    );
  });
});
