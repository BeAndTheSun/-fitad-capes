import { selectWebhooksSchema } from '@meltstudio/zod-schemas';
import { makeApi } from '@zodios/core';
import { z } from 'zod';

import { apiCommonErrorSchema } from '@/api/routers/def-utils';

export const webhooksApiDef = makeApi([
  {
    alias: 'createWebhook',
    description: 'Create a new webhook',
    method: 'post',
    path: '/',
    parameters: [
      {
        type: 'Body',
        description: 'Webhook data',
        name: 'body',
        schema: selectWebhooksSchema.omit({ id: true, createdAt: true }),
      },
    ],
    response: selectWebhooksSchema,
    errors: [
      {
        status: 400,
        description: 'Invalid format for path',
        schema: apiCommonErrorSchema,
      },
      {
        status: 401,
        description: 'Unauthorized',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'deleteWebhook',
    description: 'Delete Webhook',
    method: 'delete',
    path: '/delete',
    parameters: [
      {
        type: 'Body',
        description: 'delete webhook',
        name: 'body',
        schema: selectWebhooksSchema.pick({ id: true }),
      },
    ],
    response: z.object({ success: z.boolean() }),
    errors: [
      {
        status: 401,
        description: 'Unauthorized',
        schema: apiCommonErrorSchema,
      },
      {
        status: 404,
        description: 'Webhook not found',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'listAllWebhooks',
    description: 'List all webhooks',
    method: 'get',
    path: '/:workspaceId',
    parameters: [
      {
        type: 'Query',
        description: '',
        name: 'query',
        schema: z
          .object({
            pagination: z
              .object({
                pageIndex: z
                  .union([z.string(), z.number().nonnegative()])
                  .optional(),
                pageSize: z
                  .union([z.string(), z.number().nonnegative()])
                  .optional(),
              })
              .optional(),
            filters: z
              .object({
                search: z.string().optional(),
                id: z.string().optional(),
                url: z.string().optional(),
                name: z.string().optional(),
              })
              .optional(),
            sorting: z
              .array(
                z.object({
                  column: z.enum(['name', 'url']),
                  order: z.enum(['asc', 'desc']),
                })
              )
              .optional(),
          })
          .nullish(),
      },
    ],
    response: z.object({
      items: z.array(
        z.object({
          id: z.string(),
          url: z.string(),
          name: z.string(),
        })
      ),
      total: z.number(),
      limit: z.number(),
      offset: z.number(),
      pageCount: z.number(),
    }),
    errors: [
      {
        status: 401,
        description: 'Unauthorized',
        schema: apiCommonErrorSchema,
      },
      {
        status: 500,
        description: 'Failed to fetch webhook urls',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'getWebhookEvents',
    description: 'Get Webhook Events',
    method: 'get',
    path: '/events/:webhookId',
    response: z.object({
      items: z.array(
        z.object({
          id: z.string(),
          targetUrl: z.string(),
          payload: z.object({}),
          response: z.object({}).nullable(),
          status: z.string(),
          errorMessage: z.string().nullable(),
          createdAt: z.string(),
          name: z.string(),
          workspaceId: z.string(),
          eventType: z.string(),
          webhookId: z.string(),
          eventTableName: z.string(),
        })
      ),
      total: z.number(),
      limit: z.number(),
      offset: z.number(),
      pageCount: z.number(),
    }),
    status: 200,
    parameters: [
      {
        type: 'Query',
        description: '',
        name: 'query',
        schema: z
          .object({
            pagination: z
              .object({
                pageIndex: z
                  .union([z.string(), z.number().nonnegative()])
                  .optional(),
                pageSize: z
                  .union([z.string(), z.number().nonnegative()])
                  .optional(),
              })
              .optional(),
            filters: z
              .object({
                search: z.string().optional(),
                status: z.string().optional(),
                eventType: z.string().optional(),
                eventTableName: z.string().optional(),
              })
              .optional(),
            sorting: z
              .array(
                z.object({
                  column: z.enum(['status', 'eventType', 'eventTableName']),
                  order: z.enum(['asc', 'desc']),
                })
              )
              .optional(),
          })
          .nullish(),
      },
    ],
    errors: [
      {
        status: 401,
        description: 'Unauthorized',
        schema: apiCommonErrorSchema,
      },
      {
        status: 500,
        description: 'Failed to fetch webhook events',
        schema: apiCommonErrorSchema,
      },
    ],
  },
]);
