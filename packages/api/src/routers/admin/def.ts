import { makeApi } from '@zodios/core';
import { z } from 'zod';

import { apiCommonErrorSchema } from '@/api/routers/def-utils';

const relationSchema = z.object({
  id: z.string(),
  label: z.string(),
});

const recordSchema = z.object({
  data: z.unknown(),
  relations: z
    .array(
      z.object({
        relationModel: z.string(),
        relatedIds: z.array(z.string()), // The IDs of the related records
      })
    )
    .optional(),
});

export const adminApiDef = makeApi([
  {
    alias: 'getRecords',
    description: 'Get records for a model',
    method: 'get',
    path: '/:model',
    parameters: [
      { name: 'model', type: 'Path', schema: z.string() },
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
                role: z.string().optional(),
                isSuperAdmin: z.coerce.boolean().optional(),
                isActive: z.coerce.boolean().optional(),
              })
              .optional(),
          })
          .nullish(),
      },
    ],
    response: z.object({
      items: z.array(z.unknown()),
      total: z.number(),
      limit: z.number(),
      offset: z.number(),
      pageCount: z.number(),
      currentPage: z.number(),
    }),
    errors: [
      {
        status: 400,
        description: 'Bad request',
        schema: apiCommonErrorSchema,
      },
      {
        status: 401,
        description: 'Invalid auth',
        schema: apiCommonErrorSchema,
      },
      {
        status: 404,
        description: 'Model not found',
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
    alias: 'getRecord',
    description: 'Get a record by ID',
    method: 'get',
    path: '/:model/:id',
    parameters: [
      {
        name: 'model',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'id',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: z.unknown(),
    errors: [
      {
        status: 400,
        description: 'Bad request',
        schema: apiCommonErrorSchema,
      },
      {
        status: 401,
        description: 'Invalid auth',
        schema: apiCommonErrorSchema,
      },
      {
        status: 404,
        description: 'Model not found',
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
    alias: 'updateRecord',
    description: 'Update a record by ID',
    method: 'put',
    path: '/:model/:id',
    parameters: [
      {
        name: 'model',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'id',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'data',
        type: 'Body',
        schema: recordSchema,
      },
    ],
    response: z.unknown(),
    errors: [
      {
        status: 400,
        description: 'Bad request',
        schema: apiCommonErrorSchema,
      },
      {
        status: 401,
        description: 'Invalid auth',
        schema: apiCommonErrorSchema,
      },
      {
        status: 404,
        description: 'Model not found',
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
    alias: 'deleteRecord',
    description: 'Remove a record by ID',
    method: 'delete',
    path: '/:model/:id',
    parameters: [
      {
        name: 'model',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'id',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: z.unknown(),
    errors: [
      {
        status: 400,
        description: 'Bad request',
        schema: apiCommonErrorSchema,
      },
      {
        status: 401,
        description: 'Invalid auth',
        schema: apiCommonErrorSchema,
      },
      {
        status: 404,
        description: 'Model not found',
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
    alias: 'createRecord',
    description: 'Create a record',
    method: 'post',
    path: '/:model',
    parameters: [
      {
        name: 'model',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'data',
        type: 'Body',
        schema: recordSchema,
      },
    ],
    response: z.unknown(),
    errors: [
      {
        status: 400,
        description: 'Bad request',
        schema: apiCommonErrorSchema,
      },
      {
        status: 401,
        description: 'Invalid auth',
        schema: apiCommonErrorSchema,
      },
      {
        status: 404,
        description: 'Model not found',
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
    alias: 'getModelRelation',
    description: 'Get relations for a model',
    method: 'get',
    path: '/:model/relations/:relation',
    parameters: [
      {
        name: 'model',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'relation',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: z.array(relationSchema),
    errors: [
      {
        status: 400,
        description: 'Bad request',
        schema: apiCommonErrorSchema,
      },
      {
        status: 401,
        description: 'Invalid auth',
        schema: apiCommonErrorSchema,
      },
      {
        status: 404,
        description: 'Model not found',
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
    alias: 'updateGTMId',
    description: 'Update google tag manager id',
    method: 'post',
    path: '/updateGTMId',
    parameters: [
      {
        name: 'data',
        type: 'Body',
        schema: z.object({
          gtmId: z.string(),
        }),
      },
    ],
    response: z.unknown(),
    errors: [
      {
        status: 400,
        description: 'Bad request',
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
]);
