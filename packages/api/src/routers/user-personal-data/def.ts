import { makeApi } from '@zodios/core';
import { z } from 'zod';

import { apiCommonErrorSchema } from '@/api/routers/def-utils';

const userPersonalDataSchema = z.object({
  fullName: z.string(),
  phoneNumber: z.string(),
  fitnessGoal: z.string(),
  sponsoring: z.string(),
});

export const userPersonalDataApiDef = makeApi([
  {
    alias: 'getUserPersonalData',
    description: 'Get user personal data',
    method: 'get',
    path: '/:userId',
    parameters: [
      {
        type: 'Path',
        description: 'User ID',
        name: 'userId',
        schema: z.string(),
      },
    ],
    response: userPersonalDataSchema,
    errors: [
      {
        status: 401,
        description: 'Unauthorized',
        schema: apiCommonErrorSchema,
      },
      {
        status: 404,
        description: 'User not found',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'updateUserPersonalData',
    description: 'Update user personal data',
    method: 'post',
    path: '/:userId',
    parameters: [
      {
        type: 'Path',
        description: 'User ID',
        name: 'userId',
        schema: z.string(),
      },
      {
        type: 'Body',
        description: 'User personal data',
        name: 'body',
        schema: userPersonalDataSchema,
      },
    ],
    response: userPersonalDataSchema,
    errors: [
      {
        status: 400,
        description: 'Missing required fields',
        schema: apiCommonErrorSchema,
      },
      {
        status: 401,
        description: 'Unauthorized',
        schema: apiCommonErrorSchema,
      },
      {
        status: 404,
        description: 'User not found',
        schema: apiCommonErrorSchema,
      },
      {
        status: 500,
        description: 'Failed to update user personal data',
        schema: apiCommonErrorSchema,
      },
    ],
  },
]);
