import { json2csv } from 'json-2-csv';

import type { DbModelRecord } from '@/db/models/db';

export const exportModelToCSV = async (
  model: DbModelRecord
): Promise<{ csvFileName: string; csvData: string }> => {
  const data = await model.findMany();
  const csvData = json2csv(data);
  const csvFileName = `${model.dbTableName}.csv`;
  return { csvFileName, csvData };
};
