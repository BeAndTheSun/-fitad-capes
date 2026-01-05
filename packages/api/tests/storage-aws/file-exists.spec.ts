import { HeadObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { jest } from '@jest/globals';
import { mockClient } from 'aws-sdk-client-mock';
import { expectToUseAws } from 'tests/utils';

import { config } from '@/api/config';
import { fileExistsOnS3 } from '@/api/utils/aws';

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

const s3Mock = mockClient(S3Client);

describe('fileExistsOnS3', () => {
  const mockKey = 'test-key.jpg';

  beforeEach(() => {
    jest.clearAllMocks();
    s3Mock.reset();
  });
  it('should return true when file exists', async () => {
    expectToUseAws();
    s3Mock.on(HeadObjectCommand).resolves({
      $metadata: {
        httpStatusCode: 200,
      },
    });
    const result = await fileExistsOnS3(mockKey);
    expect(result).toBe(true);
    // test the HeadObjectCommand args
    expect(
      s3Mock.commandCalls(HeadObjectCommand)[0]!.args[0].input
    ).toStrictEqual({
      Bucket: config.storage.bucketName,
      Key: mockKey,
    });
  });

  it('should return false when file does not exist (404)', async () => {
    expectToUseAws();
    s3Mock.on(HeadObjectCommand).rejects({
      $metadata: {
        httpStatusCode: 404,
      },
    });
    const result = await fileExistsOnS3(mockKey);
    expect(result).toBe(false);
  });

  it('should return false when file does not exist and user does not have list permissions (403)', async () => {
    expectToUseAws();
    s3Mock.on(HeadObjectCommand).rejects({
      $metadata: {
        httpStatusCode: 403,
      },
    });
    const result = await fileExistsOnS3(mockKey);
    expect(result).toBe(false);
  });

  it('should throw error for other failure cases', async () => {
    expectToUseAws();
    s3Mock.on(HeadObjectCommand).rejects({
      $metadata: {
        httpStatusCode: 500,
      },
    });
    await expect(fileExistsOnS3(mockKey)).rejects.toBeDefined();
  });
});
