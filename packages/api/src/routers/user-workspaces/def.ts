import {
  selectUserSchema,
  selectUserWorkspacesSchema,
  selectWorkspaceSchema,
} from '@meltstudio/zod-schemas';
import { makeApi } from '@zodios/core';
import { z } from 'zod';

import { apiCommonErrorSchema } from '@/api/routers/def-utils';

// Trainer schema: pick id, name, email from user schema
const trainerSchema = selectUserSchema.pick({
  id: true,
  name: true,
  email: true,
});

// Member participation schema: combine user workspace role, workspace info, and user info
const memberParticipationSchema = selectUserWorkspacesSchema
  .pick({
    workspaceId: true,
    role: true,
  })
  .extend({
    workspaceName: selectWorkspaceSchema.shape.name,
    email: selectUserSchema.shape.email,
    name: selectUserSchema.shape.name,
  });

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
  {
    alias: 'getWorkspaceTrainer',
    description: 'Get trainer information for a workspace',
    method: 'get',
    path: '/workspace/:workspaceId/trainer',
    parameters: [
      {
        type: 'Path',
        description: 'Workspace ID',
        name: 'workspaceId',
        schema: z.string(),
      },
    ],
    response: trainerSchema.nullable(),
    errors: [
      {
        status: 400,
        description: 'Workspace ID is required',
        schema: apiCommonErrorSchema,
      },
      {
        status: 401,
        description: 'Unauthorized',
        schema: apiCommonErrorSchema,
      },
      {
        status: 404,
        description: 'Workspace not found',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'getMemberParticipation',
    description: 'Get member participation information for a workspace',
    method: 'get',
    path: '/workspace/:workspaceId/member-participation',
    parameters: [
      {
        type: 'Path',
        description: 'Workspace ID',
        name: 'workspaceId',
        schema: z.string(),
      },
    ],
    response: memberParticipationSchema,
    errors: [
      {
        status: 401,
        description: 'Unauthorized',
        schema: apiCommonErrorSchema,
      },
      {
        status: 400,
        description: 'Workspace ID is required',
        schema: apiCommonErrorSchema,
      },
      {
        status: 404,
        description: 'Workspace or user not found',
        schema: apiCommonErrorSchema,
      },
    ],
  },
]);
