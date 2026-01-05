/* eslint-disable import/first */
process.env.NEXT_PUBLIC_FILE_STORAGE_PROVIDER = 'vercel';
process.env.FILE_STORAGE_PROVIDER = 'vercel';
import { expectToUseVercel } from 'tests/utils';

import { getFileUrlVercelBlob } from '@/api/utils/vercel/get-url';

describe('getFileUrlVercel', () => {
  const mockKey = 'test-key.jpg';
  const mockUrl =
    'https://asdfghjk.public.blob.vercel-storage.com/test-key.jpg';

  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should generate URL', () => {
    expectToUseVercel();
    const url = getFileUrlVercelBlob(mockKey);
    expect(url).toBe(mockUrl);
  });
});
