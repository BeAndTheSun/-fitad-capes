import { UserRoleEnum } from '@meltstudio/types';
import { selectWorkspaceProfileSchema } from '@meltstudio/zod-schemas/src/workspace-profile';
import { makeApi } from '@zodios/core';
import { z } from 'zod';

import { apiCommonErrorSchema } from '@/api/routers/def-utils';

export const workspaceProfileApiDef = makeApi([
  {
    alias: 'createWorkspaceProfile',
    description: 'Create a new workspace profile',
    method: 'post',
    path: '/',
    parameters: [
      {
        type: 'Body',
        description: 'Workspace profile data',
        name: 'body',
        schema: z.object({
          workspaceId: z.string(),
          description: z.string(),
          instagramUrl: z.string().url().optional(),
          facebookUrl: z.string().url().optional(),
          companyUrl: z.string().url().optional(),
          linkedinUrl: z.string().url().optional(),
          members: z.array(
            z.object({
              email: z.string(),
              role: z.nativeEnum(UserRoleEnum),
            })
          ),
          // include the user who makes the request as admin in the new workspace
          includeCreatorInWorkspace: z.boolean().optional(),
        }),
      },
    ],
    response: selectWorkspaceProfileSchema,
    errors: [
      {
        status: 400,
        description: 'Bad Request',
        schema: apiCommonErrorSchema,
      },
      {
        status: 401,
        description: 'Unauthorized',
        schema: apiCommonErrorSchema,
      },
      {
        status: 404,
        description: 'Not found',
        schema: apiCommonErrorSchema,
      },
      {
        status: 409,
        description: 'Profile already exists for this workspaceId',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'getWorkspaceProfile',
    description: 'Get a workspace profile by workspaceId',
    method: 'get',
    path: '/:workspaceId',
    parameters: [
      {
        type: 'Path',
        description: 'The ID of the workspace to get the profile for',
        name: 'workspaceId',
        schema: z.string(),
      },
    ],
    response: selectWorkspaceProfileSchema,
    errors: [
      {
        status: 401,
        description: 'Invalid auth',
        schema: apiCommonErrorSchema,
      },
      {
        status: 400,
        description: 'WorkspaceId is required',
        schema: apiCommonErrorSchema,
      },
      {
        status: 404,
        description: 'Workspace profile not found',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'updateWorkspaceProfile',
    description: 'Update an existing workspace profile',
    method: 'put',
    path: '/:workspaceId/update',
    parameters: [
      {
        type: 'Path',
        description: 'ID of the workspace to update the profile for',
        name: 'workspaceId',
        schema: z.string(),
      },
      {
        type: 'Body',
        description: 'Updated workspace profile data',
        name: 'body',
        schema: z.object({
          description: z.string().optional(),

          instagramUrl: z.string().url().optional(),
          facebookUrl: z.string().url().optional(),
          companyUrl: z.string().url().optional(),
          linkedinUrl: z.string().url().optional(),
        }),
      },
    ],
    response: selectWorkspaceProfileSchema,
    errors: [
      {
        status: 401,
        description: 'Unauthorized',
        schema: apiCommonErrorSchema,
      },
      {
        status: 404,
        description: 'Workspace profile not found',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'deleteWorkspaceProfile',
    description: 'Delete a workspace profile',
    method: 'delete',
    path: '/:workspaceId/delete',
    parameters: [
      {
        type: 'Path',
        description: 'ID of the workspace to delete the profile for',
        name: 'workspaceId',
        schema: z.string(),
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
        description: 'Workspace profile not found',
        schema: apiCommonErrorSchema,
      },
    ],
  },
]);
