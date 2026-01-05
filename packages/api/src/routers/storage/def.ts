import { makeApi } from '@zodios/core';
import { z } from 'zod';

import { apiCommonErrorSchema } from '@/api/routers/def-utils';
import {
  uploadFileVercelResponseSchema,
  uploadFilveVercelBodySchema,
} from '@/api/types/vercel-types';

export const storageApiDef = makeApi([
  {
    alias: 'getFile',
    description: 'Get a file',
    method: 'get',
    path: '/files/:id',
    parameters: [
      {
        name: 'id',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: z.object({ url: z.string() }),
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
        description: 'No file found',
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
    alias: 'uploadFile',
    description: 'Get a link for uploading a file',
    method: 'post',
    path: '/files/upload',
    response: z.object({ key: z.string(), url: z.string() }),
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: z.object({
          fileExtension: z.string(),
          contentLength: z.number().positive(),
        }),
      },
    ],
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
        description: 'No file found',
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
    alias: 'uploadFileVercelBlob',
    description: 'Upload a file to vercel blob (webhook used by Vercel)',
    method: 'post',
    path: '/files/upload/vercel',
    response: uploadFileVercelResponseSchema,
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: uploadFilveVercelBodySchema,
      },
    ],
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
        description: 'No file found',
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
    alias: 'deleteFile',
    description: 'Delete a file',
    method: 'delete',
    path: '/files/:id',
    response: z.void(),
    parameters: [
      {
        name: 'id',
        type: 'Path',
        schema: z.string(),
      },
    ],
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
