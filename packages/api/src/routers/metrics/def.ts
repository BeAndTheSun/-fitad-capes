import { makeApi } from '@zodios/core';
import { z } from 'zod';

import { apiCommonErrorSchema } from '@/api/routers/def-utils';

export const metricsApiDef = makeApi([
  {
    alias: 'fetchMetrics',
    description: 'Fetch metrics data',
    method: 'post',
    immutable: true,
    path: '/',
    parameters: [
      {
        type: 'Body',
        description: 'Body values',
        name: 'body',
        schema: z.object({
          workspaceId: z.string(),
          metric: z.enum(['USERS_OVER_TIME', 'WORKSPACES_OVER_TIME']),
        }),
      },
    ],
    status: 200,
    response: z.array(
      z.object({
        date: z.string(),
        count: z.number(),
      })
    ),
    errors: [
      {
        status: 401,
        description: 'Unauthorized',
        schema: apiCommonErrorSchema,
      },
      {
        status: 400,
        description: 'Error fetching data from PostgreSQL',
        schema: apiCommonErrorSchema,
      },
    ],
  },
]);
