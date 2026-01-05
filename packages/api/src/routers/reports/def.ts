import { makeApi } from '@zodios/core';
import { z } from 'zod';

import { apiCommonErrorSchema } from '@/api/routers/def-utils';

export const reportsApiDef = makeApi([
  {
    alias: 'generateReport',
    description: 'Generate table report',
    method: 'post',
    path: '/',
    parameters: [
      {
        type: 'Body',
        description: 'Body values',
        name: 'body',
        schema: z.object({
          workspaceId: z.string(),
          name: z.string(),
          table: z.string(),
          from: z.string(),
          to: z.string(),
        }),
      },
    ],
    status: 201,
    response: z.object({
      success: z.boolean(),
    }),
    errors: [
      {
        status: 401,
        description: 'Unauthorized',
        schema: apiCommonErrorSchema,
      },
      {
        status: 400,
        description: 'Invalid table or parameters',
        schema: apiCommonErrorSchema,
      },
      {
        status: 404,
        description: 'No data found for specified parameters',
        schema: apiCommonErrorSchema,
      },
      {
        status: 500,
        description: 'Error creating report',
        schema: apiCommonErrorSchema,
      },
    ],
  },
]);
