import { makeApi } from '@zodios/core';
import { z } from 'zod';

import { apiCommonErrorSchema } from '@/api/routers/def-utils';

export const HistoricTableDataSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  userId: z.string(),
  workspaceId: z.union([z.string(), z.null()]),
  action: z.string(),
  tableName: z.string(),
  actionDescription: z.unknown().optional(),
  user: z.object({
    name: z.string(),
  }),
});

export const historicTableApiDef = makeApi([
  {
    alias: 'getHistoricTable',
    description: 'Get historic table',
    method: 'get',
    path: '/',
    response: z.object({
      historic: z.array(HistoricTableDataSchema),
    }),
    errors: [
      {
        status: 401,
        description: 'Unauthorized',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'getHistoricActionDescription',
    description: 'Get historic action description by id',
    method: 'get',
    path: '/record/:id',
    parameters: [
      {
        type: 'Path',
        description: 'Historic record id',
        name: 'id',
        schema: z.string(),
        required: true,
      },
    ],
    response: z.object({
      id: z.string(),
      action: z.string(),
      tableName: z.string(),
      recordId: z.string().nullable(),
      actionData: z.unknown(),
      timestamp: z.string(),
    }),
    errors: [
      {
        status: 401,
        description: 'Unauthorized',
        schema: apiCommonErrorSchema,
      },
      {
        status: 404,
        description: 'Historic record not found',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'getHistoricTableByWorkspaceId',
    description: 'Get historic table by workspace id',
    method: 'get',
    path: '/workspace/:workspaceId',
    parameters: [
      {
        type: 'Path',
        description: 'Workspace id',
        name: 'workspaceId',
        schema: z.string(),
        required: true,
      },
    ],
    response: z.object({
      historic: z.array(HistoricTableDataSchema),
    }),
    errors: [
      {
        status: 401,
        description: 'Unauthorized',
        schema: apiCommonErrorSchema,
      },
    ],
  },
]);
