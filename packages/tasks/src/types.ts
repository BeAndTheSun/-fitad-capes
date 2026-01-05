import { TaskStatus, TaskType } from '@meltstudio/types';
import { z } from 'zod';

export const TaskImageSchema = z.object({
  id: z.string(),
  taskType: z.nativeEnum(TaskType),
  taskData: z.unknown(),
  taskResult: z.unknown().optional(),
  status: z.nativeEnum(TaskStatus),
  createdAt: z.string(),
});

export const TaskImageByModelSchema = z.intersection(
  TaskImageSchema,
  z.object({
    modelName: z.string(),
  })
);

export type TaskImage = z.infer<typeof TaskImageSchema>;
export type TaskImageByModel = z.infer<typeof TaskImageByModelSchema>;

export const DynamoDBTaskRecordSchema = z.object({
  dynamodb: z.object({
    NewImage: z.any(),
    OldImage: z.any().optional(),
  }),
});

export const TaskNewImageSchema = z.object({
  id: z.object({ S: z.string() }),
  status: z.object({ S: z.nativeEnum(TaskStatus) }),
  taskType: z.object({ S: z.string() }),
  taskData: z.any(),
  taskResult: z.any().optional(),
  createdAt: z.object({ S: z.string() }),
  modelName: z.object({ S: z.string() }),
});

export type TaskDynamoNewImage = z.infer<typeof TaskNewImageSchema>;
