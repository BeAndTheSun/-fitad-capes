/* eslint-disable import/first */
process.env.NEXT_PUBLIC_FILE_STORAGE_PROVIDER = 'vercel';
process.env.FILE_STORAGE_PROVIDER = 'vercel';
import type { HandleUploadBody } from '@vercel/blob/client';
import { handleUpload } from '@vercel/blob/client';
import type { IncomingMessage } from 'http';
import { expectToUseVercel } from 'tests/utils';

import { uploadFileVercelBlob } from '@/api/utils/vercel';

jest.mock('@vercel/blob/client', () => ({
  handleUpload: jest.fn(),
}));

describe('uploadFileVercelBlob', () => {
  const mockBody: HandleUploadBody = {
    type: 'blob.generate-client-token',
    payload: {
      callbackUrl: 'https://example.com',
      clientPayload: 'payload',
      multipart: false,
      pathname: 'path-to-file.jpg',
    },
  };
  const mockRequest = {} as IncomingMessage;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call handleUpload with correct parameters', async () => {
    expectToUseVercel();
    (handleUpload as jest.Mock).mockResolvedValue({
      type: 'blob.generate-client-token',
      clientToken: 'mock-token',
    });

    await uploadFileVercelBlob({
      body: mockBody,
      request: mockRequest,
    });

    expect(handleUpload).toHaveBeenCalledWith(
      expect.objectContaining({
        body: mockBody,
        request: mockRequest,
      })
    );
  });

  it('should throw an error when handleUpload throws', async () => {
    expectToUseVercel();
    const mockError = new Error('Upload failed');
    (handleUpload as jest.Mock).mockRejectedValue(mockError);

    await expect(
      uploadFileVercelBlob({ body: mockBody, request: mockRequest })
    ).rejects.toThrow('Upload failed');
  });
});
