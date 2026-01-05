import type { TaskFunction, TaskType } from '@meltstudio/types';

import { exampleAsyncFunction } from './example';
import { databaseToCSV } from './export-db-to-csv';
import { modelToCSV } from './export-db-to-csv/model-to-csv';

export const AsyncTasks: Record<TaskType, TaskFunction> = {
  EXAMPLE_TASK: exampleAsyncFunction,
  EXPORT_DB_TO_CSV: databaseToCSV,
  EXPORT_MODEL_TO_CSV: modelToCSV,
};
