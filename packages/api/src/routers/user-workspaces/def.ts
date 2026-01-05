import { selectUserWorkspacesSchema } from '@meltstudio/zod-schemas';
import { makeApi } from '@zodios/core';
import { z } from 'zod';

import { apiCommonErrorSchema } from '@/api/routers/def-utils';

export const userWorkspacesApiDef = makeApi([
  {
    alias: 'createUserWorkspace',
    description: 'Create a new user workspace',
    method: 'post',
    path: '/',
    parameters: [
      {
        type: 'Body',
        description: 'User workspace data',
        name: 'body',
        schema: z.object({
          workspaceId: z.string(),
          email: z.string(),
          role: z.string(),
        }),
      },
    ],
    response: selectUserWorkspacesSchema,
    errors: [
      {
        status: 401,
        description: 'Unauthorized',
        schema: apiCommonErrorSchema,
      },
      {
        status: 404,
        description: 'User not exist',
        schema: apiCommonErrorSchema,
      },
    ],
  },
]);
