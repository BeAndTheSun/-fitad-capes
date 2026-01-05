import type { DbModelKeys } from '@meltstudio/db/src/models/db';
import { dbModelKeys } from '@meltstudio/db/src/models/db';
import { TaskImageByModelSchema, TaskImageSchema } from '@meltstudio/tasks';
import { makeApi } from '@zodios/core';
import { z } from 'zod';

import { apiCommonErrorSchema } from '@/api/routers/def-utils';

export const taskRunnerApiDef = makeApi([
  {
    alias: 'exportDatabaseToCSV',
    description: 'Export database to CSV',
    method: 'post',
    path: '/export-db',
    parameters: [
      {
        type: 'Body',
        description: 'Email to send the CSV to',
        name: 'body',
        schema: z.object({
          email: z.string().email(),
        }),
      },
    ],
    response: z.object({
      success: z.boolean(),
      id: z.string(),
    }),
    errors: [
      {
        status: 400,
        description: 'Bad Request',
        schema: apiCommonErrorSchema,
      },
      {
        status: 401,
        description: 'Invalid auth',
        schema: apiCommonErrorSchema,
      },
      {
        status: 500,
        description: 'Internal server error',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'getAllAsyncTasksByModel',
    description: 'Get all tasks by model',
    method: 'get',
    path: '/:modelName/tasksByModel',
    parameters: [
      {
        type: 'Path',
        description: 'model name',
        name: 'modelName',
        schema: z.enum(dbModelKeys as [DbModelKeys, ...DbModelKeys[]]),
      },
    ],
    response: z.array(TaskImageByModelSchema),
    errors: [
      {
        status: 400,
        description: 'Bad Request',
        schema: apiCommonErrorSchema,
      },
      {
        status: 401,
        description: 'Invalid auth',
        schema: apiCommonErrorSchema,
      },
      {
        status: 404,
        description: 'Invalid auth',
        schema: apiCommonErrorSchema,
      },
      {
        status: 500,
        description: 'Internal server error',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'getAllAsyncTasks',
    description: 'Get all tasks',
    method: 'get',
    path: '/tasks',
    response: z.array(TaskImageSchema),
    errors: [
      {
        status: 400,
        description: 'Bad Request',
        schema: apiCommonErrorSchema,
      },
      {
        status: 401,
        description: 'Invalid auth',
        schema: apiCommonErrorSchema,
      },
      {
        status: 404,
        description: 'Invalid auth',
        schema: apiCommonErrorSchema,
      },
      {
        status: 500,
        description: 'Internal server error',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'getAsyncTask',
    description: 'Get a specific task',
    method: 'get',
    path: '/tasks/:taskId',
    parameters: [
      {
        type: 'Path',
        description: 'Email to send the CSV to',
        name: 'taskId',
        schema: z.string(),
      },
    ],
    response: TaskImageSchema,
    errors: [
      {
        status: 400,
        description: 'Bad Request',
        schema: apiCommonErrorSchema,
      },
      {
        status: 401,
        description: 'Invalid auth',
        schema: apiCommonErrorSchema,
      },
      {
        status: 404,
        description: 'Invalid auth',
        schema: apiCommonErrorSchema,
      },
      {
        status: 500,
        description: 'Internal server error',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'exportModelToCSV',
    description: 'Export model to CSV',
    method: 'post',
    path: '/:modelName/export-model',
    parameters: [
      {
        type: 'Body',
        description: 'Email to send the CSV to',
        name: 'body',
        schema: z.object({
          email: z.string().email(),
        }),
      },
      {
        type: 'Path',
        description: 'Model name to export',
        name: 'modelName',
        schema: z.string(),
      },
    ],
    response: z.object({
      success: z.boolean(),
      id: z.string(),
    }),
    errors: [
      {
        status: 400,
        description: 'Bad Request',
        schema: apiCommonErrorSchema,
      },
      {
        status: 401,
        description: 'Invalid auth',
        schema: apiCommonErrorSchema,
      },
      {
        status: 500,
        description: 'Internal server error',
        schema: apiCommonErrorSchema,
      },
      {
        status: 404,
        description: 'Model not found',
        schema: apiCommonErrorSchema,
      },
    ],
  },
]);
