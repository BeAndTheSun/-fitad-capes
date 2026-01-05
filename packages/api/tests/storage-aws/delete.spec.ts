import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { jest } from '@jest/globals';
import { mockClient } from 'aws-sdk-client-mock';
import { expectToUseAws } from 'tests/utils';

import { config } from '@/api/config';
import { deleteFileS3 } from '@/api/utils/aws';

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

const s3Mock = mockClient(S3Client);

describe('deleteFileS3', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    s3Mock.reset();
  });

  it('should send a DeleteObjectCommand with correct parameters', async () => {
    expectToUseAws();
    const testId = 'test-file-id';
    s3Mock.on(DeleteObjectCommand).resolves({});

    await deleteFileS3(testId);

    // test the DeleteObjectCommand args
    expect(
      s3Mock.commandCalls(DeleteObjectCommand)[0]!.args[0].input
    ).toStrictEqual({
      Bucket: config.storage.bucketName,
      Key: testId,
    });
  });

  it('should throw an error if the S3 operation fails', async () => {
    expectToUseAws();
    const testId = 'test-file-id';
    const error = new Error('S3 Delete Error');
    s3Mock.on(DeleteObjectCommand).rejects(error);

    await expect(deleteFileS3(testId)).rejects.toBeDefined();
  });
});
