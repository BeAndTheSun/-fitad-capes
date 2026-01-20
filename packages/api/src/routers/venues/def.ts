import { makeApi } from '@zodios/core';
import { z } from 'zod';

import { apiCommonErrorSchema } from '@/api/routers/def-utils';
import { updateVenueSchema, venueWithOwnerSchema } from '@/api/schemas/venues';

export const venuesApi = makeApi([
  {
    alias: 'getVenues',
    description: 'Get venues',
    method: 'get',
    path: '/:workspaceId/list',
    parameters: [
      {
        type: 'Path',
        description: 'Workspace id',
        name: 'workspaceId',
        schema: z.string(),
      },
      {
        type: 'Query',
        description: 'Search query',
        name: 'search',
        schema: z.string().optional(),
      },
      {
        type: 'Query',
        description: 'Page index',
        name: 'pageIndex',
        schema: z.coerce.number().optional(),
      },
      {
        type: 'Query',
        description: 'Page size',
        name: 'pageSize',
        schema: z.coerce.number().optional(),
      },
    ],
    response: z.object({
      items: z.array(venueWithOwnerSchema),
      total: z.number(),
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
    alias: 'getMyVenues',
    description: 'Get venues assigned to the current user',
    method: 'get',
    path: '/:workspaceId/my-venues',
    parameters: [
      {
        type: 'Path',
        description: 'Workspace id',
        name: 'workspaceId',
        schema: z.string(),
      },
      {
        type: 'Query',
        description: 'Search query',
        name: 'search',
        schema: z.string().optional(),
      },
      {
        type: 'Query',
        description: 'Page index',
        name: 'pageIndex',
        schema: z.coerce.number().optional(),
      },
      {
        type: 'Query',
        description: 'Page size',
        name: 'pageSize',
        schema: z.coerce.number().optional(),
      },
    ],
    response: z.object({
      items: z.array(venueWithOwnerSchema),
      total: z.number(),
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
    alias: 'generateVenueInvitation',
    description: 'Generate or get existing invitation token for a venue',
    method: 'post',
    path: '/:workspaceId/venues/:venueId/generate-invitation',
    parameters: [
      {
        type: 'Path',
        description: 'Workspace id',
        name: 'workspaceId',
        schema: z.string(),
      },
      {
        type: 'Path',
        description: 'Venue id',
        name: 'venueId',
        schema: z.string(),
      },
    ],
    response: z.object({
      token: z.string(),
      invitationUrl: z.string(),
    }),
    errors: [
      {
        status: 401,
        description: 'Unauthorized',
        schema: apiCommonErrorSchema,
      },
      {
        status: 403,
        description: 'Forbidden - Not a trainer/admin or venue inactive',
        schema: apiCommonErrorSchema,
      },
      {
        status: 404,
        description: 'Venue not found',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'validateVenueInvitation',
    description: 'Validate invitation token and get venue details',
    method: 'get',
    path: '/invitation/:token/validate',
    parameters: [
      {
        type: 'Path',
        description: 'Invitation token',
        name: 'token',
        schema: z.string(),
      },
      {
        type: 'Query',
        description: 'Workspace ID',
        name: 'workspaceId',
        schema: z.string(),
      },
    ],
    response: z.object({
      venue: venueWithOwnerSchema.extend({
        workspaceId: z.string().optional(),
      }),
      trainer: z
        .object({
          id: z.string(),
          name: z.string(),
          email: z.string(),
        })
        .nullable(),
      workspace: z
        .object({
          id: z.string(),
          name: z.string(),
        })
        .nullable()
        .optional(),
      workspaceId: z.string(),
    }),
    errors: [
      {
        status: 404,
        description: 'Invalid or expired token',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'acceptVenueInvitation',
    description: 'Accept venue invitation and join the venue',
    method: 'post',
    path: '/invitation/:token/accept',
    parameters: [
      {
        type: 'Path',
        description: 'Invitation token',
        name: 'token',
        schema: z.string(),
      },
      {
        type: 'Body',
        description: 'Workspace ID',
        name: 'body',
        schema: z.object({
          workspaceId: z.string(),
        }),
      },
    ],
    response: z.object({
      success: z.boolean(),
      venueId: z.string(),
      message: z.string(),
      addedToWorkspace: z.boolean().optional(),
    }),
    errors: [
      {
        status: 400,
        description: 'Missing workspace ID',
        schema: apiCommonErrorSchema,
      },
      {
        status: 401,
        description: 'Unauthorized',
        schema: apiCommonErrorSchema,
      },
      {
        status: 403,
        description: 'User already in venue',
        schema: apiCommonErrorSchema,
      },
      {
        status: 404,
        description: 'Invalid token',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'rejectVenueInvitation',
    description: 'Reject venue invitation',
    method: 'post',
    path: '/invitation/:token/reject',
    parameters: [
      {
        type: 'Path',
        description: 'Invitation token',
        name: 'token',
        schema: z.string(),
      },
    ],
    response: z.object({
      success: z.boolean(),
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
    alias: 'generateVenueCheckIn',
    description: 'Generate or get existing check-in token for a venue',
    method: 'post',
    path: '/:workspaceId/venues/:venueId/generate-check-in',
    parameters: [
      {
        type: 'Path',
        description: 'Workspace id',
        name: 'workspaceId',
        schema: z.string(),
      },
      {
        type: 'Path',
        description: 'Venue id',
        name: 'venueId',
        schema: z.string(),
      },
    ],
    response: z.object({
      token: z.string(),
      checkInUrl: z.string(),
    }),
    errors: [
      {
        status: 401,
        description: 'Unauthorized',
        schema: apiCommonErrorSchema,
      },
      {
        status: 403,
        description: 'Forbidden - Not a trainer/admin',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'validateVenueCheckIn',
    description: 'Validate check-in token and get venue details',
    method: 'get',
    path: '/check-in/:token/validate',
    parameters: [
      {
        type: 'Path',
        description: 'Check-in token',
        name: 'token',
        schema: z.string(),
      },
    ],
    response: z.object({
      venue: venueWithOwnerSchema,
      isActive: z.boolean(),
      userStatus: z.string(),
      canCheckIn: z.boolean(),
    }),
    errors: [
      {
        status: 401,
        description: 'Unauthorized - User not logged in',
        schema: apiCommonErrorSchema,
      },
      {
        status: 400,
        description: 'Bad request - User cannot check in',
        schema: apiCommonErrorSchema,
      },
      {
        status: 404,
        description: 'Invalid or expired token',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'performVenueCheckIn',
    description: 'Perform check-in to venue',
    method: 'post',
    path: '/check-in/:token/perform',
    parameters: [
      {
        type: 'Path',
        description: 'Check-in token',
        name: 'token',
        schema: z.string(),
      },
    ],
    response: z.object({
      success: z.boolean(),
      venueId: z.string(),
      venueName: z.string(),
      message: z.string(),
    }),
    errors: [
      {
        status: 401,
        description: 'Unauthorized',
        schema: apiCommonErrorSchema,
      },
      {
        status: 400,
        description: 'Bad request',
        schema: apiCommonErrorSchema,
      },
      {
        status: 404,
        description: 'Invalid token',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'toggleVenueStatus',
    description: 'Activate or deactivate a venue',
    method: 'patch',
    path: '/:workspaceId/venues/:venueId/status',
    parameters: [
      {
        type: 'Path',
        description: 'Workspace id',
        name: 'workspaceId',
        schema: z.string(),
      },
      {
        type: 'Path',
        description: 'Venue id',
        name: 'venueId',
        schema: z.string(),
      },
      {
        type: 'Body',
        description: 'Venue status',
        name: 'body',
        schema: z.object({
          isActive: z.boolean(),
        }),
      },
    ],
    response: z.object({
      success: z.boolean(),
      venue: venueWithOwnerSchema,
    }),
    errors: [
      {
        status: 401,
        description: 'Unauthorized',
        schema: apiCommonErrorSchema,
      },
      {
        status: 403,
        description: 'Forbidden - Not a super admin',
        schema: apiCommonErrorSchema,
      },
      {
        status: 404,
        description: 'Venue not found',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'updateVenueUserStatus',
    description: 'Update status of a venue user (super participant)',
    method: 'patch',
    path: '/:workspaceId/venues/:venueId/users/:userId/status',
    parameters: [
      {
        type: 'Path',
        description: 'Workspace id',
        name: 'workspaceId',
        schema: z.string(),
      },
      {
        type: 'Path',
        description: 'Venue id',
        name: 'venueId',
        schema: z.string(),
      },
      {
        type: 'Path',
        description: 'User id',
        name: 'userId',
        schema: z.string(),
      },
      {
        type: 'Body',
        description: 'New status for the venue user',
        name: 'body',
        schema: z.object({
          status: z.enum(['joined', 'checking', 'completed', 'failed']),
        }),
      },
    ],
    response: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
    errors: [
      {
        status: 401,
        description: 'Unauthorized',
        schema: apiCommonErrorSchema,
      },
      {
        status: 403,
        description: 'Forbidden - Not a trainer/admin',
        schema: apiCommonErrorSchema,
      },
      {
        status: 404,
        description: 'Venue or user not found',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'getVenuesOfUser',
    method: 'get',
    path: '/user/:userId',
    description: 'Get venues of a user',
    parameters: [
      {
        type: 'Path',
        description: 'User ID',
        name: 'userId',
        schema: z.string(),
      },
    ],
    response: z.array(venueWithOwnerSchema),
    errors: [
      {
        status: 401,
        description: 'Invalid auth',
        schema: apiCommonErrorSchema,
      },
      {
        status: 500,
        description: 'Failed to get venues',
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
    alias: 'getVenueById',
    method: 'get',
    path: '/:venueId',
    description: 'Get venue',
    parameters: [
      {
        type: 'Path',
        description: 'Venue ID',
        name: 'venueId',
        schema: z.string(),
      },
    ],
    response: venueWithOwnerSchema,
    errors: [
      {
        status: 401,
        description: 'Invalid auth',
        schema: apiCommonErrorSchema,
      },
      {
        status: 500,
        description: 'Failed to get venue',
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
    alias: 'updateVenueById',
    method: 'patch',
    path: '/:venueId',
    description: 'Update venue',
    parameters: [
      {
        type: 'Path',
        description: 'Venue ID',
        name: 'venueId',
        schema: z.string(),
      },
      {
        type: 'Body',
        description: 'Update venue data',
        name: 'body',
        schema: updateVenueSchema,
      },
    ],
    response: venueWithOwnerSchema,
    errors: [
      {
        status: 401,
        description: 'Invalid auth',
        schema: apiCommonErrorSchema,
      },
      {
        status: 500,
        description: 'Failed to update venue',
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
