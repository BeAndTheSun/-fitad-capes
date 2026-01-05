import type { TaskFunction } from '@meltstudio/types';
import { z } from 'zod';

import { logger } from '@/task-runner/logger';

const ExampleAsyncFunctionDataSchema = z.object({
  message: z.string().min(1),
});

export const exampleAsyncFunction: TaskFunction = async (data) => {
  const parsedData = ExampleAsyncFunctionDataSchema.safeParse(data);

  if (!parsedData.success) {
    return { error: 'Invalid data' };
  }

  const { message } = parsedData.data;

  // Wait for 1 second
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 1000);
  });

  logger.info(`Function Triggered | Message: ${message}`);

  return { error: null };
};
