import { TaskStatus, TaskType } from '@meltstudio/types';
import { z } from 'zod';

export const TaskImageSchema = z.object({
  id: z.string(),
  taskType: z.nativeEnum(TaskType),
  taskData: z.unknown(),
  status: z.nativeEnum(TaskStatus),
});

export type TaskImage = z.infer<typeof TaskImageSchema>;

export const DynamoDBTaskRecordSchema = z.object({
  dynamodb: z.object({
    NewImage: z.any(),
    OldImage: z.any().optional(),
  }),
});
