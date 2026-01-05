import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { jest } from '@jest/globals';
import { mockClient } from 'aws-sdk-client-mock';
import { expectToUseAws } from 'tests/utils';
import { v4 as uuid } from 'uuid';

import { s3 } from '@/api/aws/s3-instance';
import { config } from '@/api/config';
import { getUploadFileUrlS3 } from '@/api/utils/aws';

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

mockClient(S3Client);

describe('getUploadFileUrlS3', () => {
  const mockFileExtension = '.jpg';
  const mockUploadKey = 'test-upload-key.jpg';
  const mockUploadUrl = 'https://example.com/upload-url';

  beforeEach(() => {
    (uuid as jest.Mock).mockReturnValue('test-upload-key');
    (getSignedUrl as jest.Mock<typeof getSignedUrl>).mockResolvedValue(
      mockUploadUrl
    );
  });

  it('should generate upload URL', async () => {
    expectToUseAws();
    const contentLength = 1024 * 1024;
    const result = await getUploadFileUrlS3({
      fileExtension: mockFileExtension,
      contentLength,
    });

    expect(result).toEqual({ key: mockUploadKey, url: mockUploadUrl });
    expect(getSignedUrl).toHaveBeenCalledWith(
      s3,
      expect.any(PutObjectCommand),
      {
        expiresIn: 600,
        signingDate: undefined,
        signableHeaders: new Set(['content-length']),
      }
    );
    // test the PutObjectCommand args
    const getSignedUrlArgsCalled = (
      getSignedUrl as jest.Mock<typeof getSignedUrl>
    ).mock.calls[0]!;
    expect(getSignedUrlArgsCalled[1].input).toStrictEqual({
      Bucket: config.storage.bucketName,
      Key: mockUploadKey,
      ContentLength: contentLength,
    });
  });

  it('should throw an error if getSignedUrl fails', async () => {
    expectToUseAws();
    const error = new Error('Signing Error');
    (getSignedUrl as jest.Mock<typeof getSignedUrl>).mockRejectedValue(error);

    await expect(
      getUploadFileUrlS3({
        fileExtension: mockFileExtension,
        contentLength: 1024 * 1024,
      })
    ).rejects.toBeDefined();
  });
});
