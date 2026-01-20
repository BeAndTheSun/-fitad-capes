import { makeApi } from '@zodios/core';
import { z } from 'zod';

import { apiCommonErrorSchema } from '@/api/routers/def-utils';
import { metricSchema } from '@/api/schemas/metrics';

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
          sessionUserId: z.string().optional(),
          metric: metricSchema,
        }),
      },
    ],
    status: 200,
    response: z.array(
      z.object({
        label: z.string(),
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
