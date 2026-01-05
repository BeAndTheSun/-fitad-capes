import { del } from '@vercel/blob';

export async function deleteFileVercelBlob(id: string): Promise<void> {
  await del(id);
}
