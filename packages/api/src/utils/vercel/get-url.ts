import { config } from '@/api/config';

export function getFileUrlVercelBlob(key: string): string {
  const url = `${config.storage.vercelBlobUrl}${key}`;
  return url;
}
