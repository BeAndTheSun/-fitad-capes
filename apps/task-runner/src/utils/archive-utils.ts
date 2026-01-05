import archiver from 'archiver';

import { logger } from '@/task-runner/logger';

/**
 * Represents a file to be included in the ZIP archive.
 */
export type ZipFile = {
  fileData: Buffer | string;
  fileName: string;
};

/**
 * Creates a ZIP archive from an array of files and returns it as a Buffer.
 *
 * @param files - Array of files, each with 'data' (content) and 'name' (filename).
 * @returns A promise that resolves to a Buffer containing the ZIP archive.
 */
export async function createZipArchive(files: ZipFile[]): Promise<Buffer> {
  const archive = archiver('zip', { zlib: { level: 9 } });
  const buffers: Buffer[] = [];

  // Collect data chunks as they are generated
  archive.on('data', (chunk) => buffers.push(chunk));
  archive.on('end', () => {
    logger.info(`Archive completed, total bytes: ${archive.pointer()}`);
  });
  archive.on('error', (err) => {
    logger.error(err);
    throw err;
  });

  // Append each file to the archive
  files.forEach(({ fileData: data, fileName: name }) => {
    archive.append(data, { name });
  });

  // Finalize the archive and wait for it to finish
  await archive.finalize();

  // Concatenate all chunks to form a single Buffer
  return Buffer.concat(buffers);
}
