import { sendEmailTemplate } from '@meltstudio/mailing';
import type { TaskFunction } from '@meltstudio/types';
import { format } from 'date-fns';
import { z } from 'zod';

import type { DbModelKeys } from '@/db/models/db';
import { dbModelKeys } from '@/db/models/db';
import { db } from '@/task-runner/deps/db';
import { logger } from '@/task-runner/logger';
import {
  createZipArchive,
  exportModelToCSV,
  uploadFile,
} from '@/task-runner/utils';

const ModelToCSVDataSchema = z.object({
  email: z.string().email(),
  modelName: z.enum(dbModelKeys as [DbModelKeys, ...DbModelKeys[]]),
});

export const modelToCSV: TaskFunction = async (data) => {
  // Parse input
  const parsedData = ModelToCSVDataSchema.safeParse(data);
  if (!parsedData.success) {
    logger.error('modelName or email are not valid', parsedData.error);
    return { error: parsedData.error.message };
  }

  const { email, modelName } = parsedData.data;

  // Prepare export
  logger.info('Exporting database to CSV');

  const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
  const zipFileName = `DB_${timestamp}_export.zip`;

  const model = db.models[modelName];

  // Prepare CSV files for each model in the database
  const file = await exportModelToCSV(model);
  logger.info(`Exporting ${model.dbTableName} to CSV`);

  const csvFile = { fileData: file.csvData, fileName: file.csvFileName };

  const zipBuffer = await createZipArchive([csvFile]);

  //  Upload the ZIP file
  const url = await uploadFile(zipFileName, zipBuffer);
  logger.info(`Download link: ${url}`);

  await sendEmailTemplate({
    template: {
      id: 'database-export',
      props: { downloadLink: url },
    },
    options: {
      to: email,
    },
  });
  logger.info(`Email with download URL sent to ${email}`);

  return { error: null, result: { downloadLink: url } };
};
