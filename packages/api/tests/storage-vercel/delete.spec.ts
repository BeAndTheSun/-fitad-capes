import { del } from '@vercel/blob';

import { deleteFileVercelBlob } from '@/api/utils/vercel/delete';

jest.mock('@vercel/blob', () => ({
  del: jest.fn(),
}));

describe('getFileUrlVercel', () => {
  const mockKey = 'test-key.jpg';

  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should call the deletion method', async () => {
    await deleteFileVercelBlob(mockKey);
    expect(del).toHaveBeenCalledWith(mockKey);
  });
});
