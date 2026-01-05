import {
  GetObjectCommand,
  HeadObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { jest } from '@jest/globals';
import { mockClient } from 'aws-sdk-client-mock';
import { expectToUseAws } from 'tests/utils';

import { s3 } from '@/api/aws/s3-instance';
import { config } from '@/api/config';
import { getFileUrlS3 } from '@/api/utils/aws';

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

const s3Mock = mockClient(S3Client);

describe('getFileUrlS3', () => {
  const mockKey = 'test-key.jpg';
  const mockUrl = 'https://example.com/test-url';

  beforeEach(() => {
    jest.clearAllMocks();
    (getSignedUrl as jest.Mock<typeof getSignedUrl>).mockResolvedValue(mockUrl);
    s3Mock.reset();
  });
  it('should generate URL', async () => {
    expectToUseAws();
    s3Mock.on(HeadObjectCommand).resolves({
      $metadata: {
        httpStatusCode: 200,
      },
    });
    const result = await getFileUrlS3(mockKey);
    expect(result).toBe(mockUrl);
    expect(getSignedUrl).toHaveBeenCalledWith(
      s3,
      expect.any(GetObjectCommand),
      expect.any(Object)
    );
    // test the GetObjectCommand args
    const getSignedUrlArgsCalled = (
      getSignedUrl as jest.Mock<typeof getSignedUrl>
    ).mock.calls[0]!;
    expect(getSignedUrlArgsCalled[1].input).toStrictEqual({
      Bucket: config.storage.bucketName,
      Key: mockKey,
      ResponseCacheControl: 'public, max-age=86400, immutable',
    });
  });

  it('should return null if file does not exist', async () => {
    expectToUseAws();
    s3Mock.on(HeadObjectCommand).rejects({
      $metadata: {
        httpStatusCode: 404,
      },
    });
    const result = await getFileUrlS3(mockKey);
    expect(result).toBeNull();
  });

  it('should handle errors from getSignedUrl', async () => {
    expectToUseAws();
    s3Mock.on(HeadObjectCommand).resolves({
      $metadata: {
        httpStatusCode: 200,
      },
    });
    (getSignedUrl as jest.Mock<typeof getSignedUrl>).mockRejectedValue(
      new Error('Signing Error')
    );
    await expect(getFileUrlS3(mockKey)).rejects.toBeDefined();
  });
});
