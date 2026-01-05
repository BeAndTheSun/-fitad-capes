import type { Config } from '@/task-runner/config/env';

describe('Config Environment Variables', () => {
  let updatedConfig: Config;

  beforeEach(() => {
    jest.resetModules();
  });

  it('should include BLOB_READ_WRITE_TOKEN when FILE_STORAGE_PROVIDER is set to vercel', async () => {
    process.env.FILE_STORAGE_PROVIDER = 'vercel';
    process.env.BLOB_READ_WRITE_TOKEN = 'vercel-token';

    updatedConfig = (await import('@/task-runner/config/env')).config;

    expect(updatedConfig.vercel.blobReadWriteToken).toBe('vercel-token');
  });

  it('should not include BLOB_READ_WRITE_TOKEN when FILE_STORAGE_PROVIDER is not vercel', async () => {
    process.env.FILE_STORAGE_PROVIDER = 'aws';
    delete process.env.BLOB_READ_WRITE_TOKEN;

    updatedConfig = (await import('@/task-runner/config/env')).config;

    expect(updatedConfig.vercel.blobReadWriteToken).toBeUndefined();
  });
});
