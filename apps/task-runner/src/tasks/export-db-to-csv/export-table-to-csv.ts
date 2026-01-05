import { json2csv } from 'json-2-csv';

import type { DbModelRecord } from '@/db/models/db';

export const exportTableToCSV = async (
  model: DbModelRecord
): Promise<string> => {
  const data = await model.findMany();
  const csvData = json2csv(data);
  return csvData;
};
