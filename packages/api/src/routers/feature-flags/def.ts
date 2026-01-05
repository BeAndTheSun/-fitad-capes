import {
  insertUserFeatureFlagsSchema,
  selectFeatureFlagsSchema,
  selectUserFeatureFlagsSchema,
} from '@meltstudio/zod-schemas';
import { makeApi } from '@zodios/core';
import { z } from 'zod';

import { apiCommonErrorSchema } from '@/api/routers/def-utils';

export const FeatureFlagDataSchema = z.object({
  flag: z.string(),
  description: z.string(),
  released: z.boolean(),
});

export const UserFeatureFlagDataSchema = z.object({
  user_id: z.string(),
  feature_flag_id: z.string(),
  released: z.boolean(),
});

export const featureFlagsApi = makeApi([
  {
    alias: 'getFeatureFlags',
    description: 'Get feature flags',
    method: 'get',
    path: '/:workspaceId/list',
    parameters: [
      {
        type: 'Path',
        description: 'Workspace id',
        name: 'workspaceId',
        schema: z.string(),
      },
    ],
    response: z.object({
      flags: z.array(
        selectFeatureFlagsSchema.extend({ allowWorkspaceControl: z.boolean() })
      ),
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
    alias: 'toggleFeatureFlag',
    description: 'Toggle feature flag',
    method: 'put',
    path: '/toggle',
    parameters: [
      {
        type: 'Body',
        description: 'toggle feature flag released status',
        name: 'body',
        schema: selectFeatureFlagsSchema.pick({ released: true, id: true }),
      },
    ],
    response: z.object({
      flag: FeatureFlagDataSchema,
    }),
    errors: [
      {
        status: 401,
        description: 'Unauthorized',
        schema: apiCommonErrorSchema,
      },
      {
        status: 404,
        description: 'Flag not found',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'createFeatureFlag',
    description: 'Create feature flag',
    method: 'post',
    path: '/',
    parameters: [
      {
        type: 'Body',
        description: 'create feature flag',
        name: 'body',
        schema: z.object({ workspaceId: z.string() }),
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
        status: 500,
        description:
          'GlobalFeatureFlag not found for one or more default flags',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'deleteFeatureFlag',
    description: 'Delete feature flag',
    method: 'delete',
    path: '/:workspaceId/delete',
    parameters: [
      {
        type: 'Body',
        description: 'create feature flag',
        name: 'body',
        schema: selectFeatureFlagsSchema.pick({ id: true }),
      },
      {
        type: 'Path',
        description: 'Workspace id',
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
    ],
  },
  {
    alias: 'getUsersWithFeatureFlag',
    description: 'Get users with feature flag',
    method: 'get',
    path: '/:workspaceId/:featureFlagId/users',
    parameters: [
      {
        type: 'Path',
        description: 'Feature flag id',
        name: 'featureFlagId',
        schema: z.string(),
      },
      {
        type: 'Path',
        description: 'Workspace id',
        name: 'workspaceId',
        schema: z.string(),
      },
    ],
    response: z.object({
      data: z.array(
        selectUserFeatureFlagsSchema.merge(
          z.object({
            user: z.object({
              name: z.string(),
              id: z.string(),
            }),
          })
        )
      ),
    }),
    errors: [
      {
        status: 401,
        description: 'Unauthorized',
        schema: apiCommonErrorSchema,
      },
      {
        status: 400,
        description: 'Flag ID is required',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'addUserFeatureFlag',
    description: 'Add a feature flag to an user',
    method: 'post',
    path: '/:workspaceId/users/add',
    parameters: [
      {
        type: 'Body',
        description: 'feature flag and user id',
        name: 'body',
        schema: insertUserFeatureFlagsSchema,
      },
      {
        type: 'Path',
        description: 'Workspace id',
        name: 'workspaceId',
        schema: z.string(),
      },
    ],
    response: selectUserFeatureFlagsSchema,
    errors: [
      {
        status: 401,
        description: 'Unauthorized',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'toggleUserFeatureFlag',
    description: 'Toggles an user feature flag',
    method: 'patch',
    path: '/users/toggle',
    parameters: [
      {
        type: 'Body',
        description: 'feature flag and user id',
        name: 'body',
        schema: insertUserFeatureFlagsSchema,
      },
    ],
    response: selectUserFeatureFlagsSchema,
    errors: [
      {
        status: 401,
        description: 'Unauthorized',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'deleteUserFeatureFlag',
    description: 'Delete user feature flag',
    method: 'delete',
    path: '/:workspaceId/users/delete',
    parameters: [
      {
        type: 'Body',
        description: 'feature flag and user id',
        name: 'body',
        schema: insertUserFeatureFlagsSchema.omit({ released: true }),
      },
      {
        type: 'Path',
        description: 'Workspace id',
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
    ],
  },
]);
