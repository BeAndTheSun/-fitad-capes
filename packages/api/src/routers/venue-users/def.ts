import { makeApi } from '@zodios/core';
import { z } from 'zod';

import { apiCommonErrorSchema } from '@/api/routers/def-utils';

export const venueUsersApiDef = makeApi([
  {
    alias: 'getUserMetrics',
    method: 'get',
    path: '/metrics/user',
    description: 'Get venue user metrics',
    response: z.array(
      z.object({
        status: z.string(),
        count: z.number(),
      })
    ),
    errors: [
      {
        status: 401,
        description: 'Invalid auth',
        schema: apiCommonErrorSchema,
      },
      {
        status: 500,
        description: 'Failed to get metrics',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'createVenueUser',
    method: 'post',
    path: '/:venueId/create',
    description: 'Create a new venue user',
    parameters: [
      {
        type: 'Body',
        description: 'Venue data',
        name: 'body',
        schema: z.object({
          userId: z.string(),
          comments: z.string().optional(),
        }),
      },
      {
        type: 'Path',
        description: 'Venue ID',
        name: 'venueId',
        schema: z.string(),
      },
    ],
    response: z.object({
      isNew: z.boolean(),
      addedToVenue: z.boolean(),
    }),
    errors: [
      {
        status: 401,
        description: 'Invalid auth',
        schema: apiCommonErrorSchema,
      },
      {
        status: 500,
        description: 'Failed to create venue user',
        schema: apiCommonErrorSchema,
      },
      {
        status: 400,
        description: 'Missing required fields',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'getMembersOfVenue',
    method: 'get',
    path: '/:venueId',
    description: 'Get members of a venue',
    parameters: [
      {
        type: 'Path',
        description: 'Venue ID',
        name: 'venueId',
        schema: z.string(),
      },
    ],
    response: z.array(
      z.object({
        id: z.string(),
        userId: z.string(),
        venueId: z.string(),
        comments: z.string().nullable(),
        status: z.enum(['joined', 'checking', 'completed', 'failed']),
        user: z.object({
          id: z.string(),
          email: z.string(),
          name: z.string(),
        }),
        venue: z.object({
          id: z.string(),
        }),
      })
    ),
    errors: [
      {
        status: 401,
        description: 'Invalid auth',
        schema: apiCommonErrorSchema,
      },
      {
        status: 500,
        description: 'Failed to get members',
        schema: apiCommonErrorSchema,
      },
      {
        status: 400,
        description: 'Missing required fields',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'deleteVenueUser',
    method: 'delete',
    path: '/:id',
    description: 'Delete a venue user',
    parameters: [
      {
        type: 'Path',
        description: 'Venue user ID',
        name: 'id',
        schema: z.string(),
      },
    ],
    response: z.object({
      deleted: z.boolean(),
    }),
    errors: [
      {
        status: 401,
        description: 'Invalid auth',
        schema: apiCommonErrorSchema,
      },
      {
        status: 500,
        description: 'Failed to delete venue user',
        schema: apiCommonErrorSchema,
      },
      {
        status: 400,
        description: 'Missing required fields',
        schema: apiCommonErrorSchema,
      },
    ],
  },
]);
