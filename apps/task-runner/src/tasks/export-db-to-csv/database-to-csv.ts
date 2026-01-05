import { sendEmailTemplate } from '@meltstudio/mailing';
import type { TaskFunction } from '@meltstudio/types';
import { format } from 'date-fns';
import { z } from 'zod';

import { db } from '@/task-runner/deps/db';
import { logger } from '@/task-runner/logger';
import {
  createZipArchive,
  exportModelToCSV,
  uploadFile,
} from '@/task-runner/utils';

const DatabaseToCSVDataSchema = z.object({
  email: z.string().email(),
});

export const databaseToCSV: TaskFunction = async (data) => {
  // Parse input
  const parsedData = DatabaseToCSVDataSchema.safeParse(data);
  if (!parsedData.success) {
    logger.error('No valid email was given', parsedData.error);
    return { error: parsedData.error.message };
  }
  const { email } = parsedData.data;

  // Prepare export
  logger.info('Exporting database to CSV');

  const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
  const zipFileName = `DB_${timestamp}_export.zip`;

  logger.info(`Creating ZIP archive: ${zipFileName}`);

  // Prepare CSV files for each model in the database
  const csvPromises = Object.values(db.models).map(async (model) => {
    logger.info(`Exporting ${model.dbTableName} to CSV`);
    const { csvFileName, csvData } = await exportModelToCSV(model);
    return { fileData: csvData, fileName: csvFileName };
  });
  const csvFiles = await Promise.all(csvPromises);

  // Create ZIP archive using the utility function
  const zipBuffer = await createZipArchive(csvFiles);

  logger.info(`Uploading zip file: ${zipFileName}`);

  // Upload the ZIP file
  const url = await uploadFile(zipFileName, zipBuffer);
  logger.info(`Download link: ${url}`);

  await sendEmailTemplate({
    template: {
      id: 'database-export',
      props: {
        downloadLink: url,
      },
    },
    options: {
      to: email,
    },
  });
  logger.info(`Email with download URL sent to ${email}`);

  return { error: null, result: { downloadLink: url } };
};
