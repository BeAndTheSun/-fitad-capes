export enum TaskStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  DONE = 'DONE',
  FAILED = 'FAILED',
}

export enum TaskType {
  EXAMPLE_TASK = 'EXAMPLE_TASK',
  EXPORT_DB_TO_CSV = 'EXPORT_DB_TO_CSV',
  EXPORT_MODEL_TO_CSV = 'EXPORT_MODEL_TO_CSV',
}

export type TaskData = unknown;

export type TaskFunction<T = unknown, R = unknown> = (
  data?: T
) => Promise<{ error: string | null; result?: R }>;
