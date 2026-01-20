import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import type { ZodiosResponseByAlias } from '@zodios/core';

import type { DbVenue } from '@/db/schema';

import type { ZodApi } from './zodios';
import { apiClient, apiHooks } from './zodios';

export type VenuesResponse = ZodiosResponseByAlias<ZodApi, 'getVenues'>;
export type MyVenuesResponse = ZodiosResponseByAlias<ZodApi, 'getMyVenues'>;
export type GenerateVenueInvitationResponse = ZodiosResponseByAlias<
  ZodApi,
  'generateVenueInvitation'
>;
export type ValidateVenueInvitationResponse = ZodiosResponseByAlias<
  ZodApi,
  'validateVenueInvitation'
>;
export type AcceptVenueInvitationResponse = ZodiosResponseByAlias<
  ZodApi,
  'acceptVenueInvitation'
>;
export type GenerateVenueCheckInResponse = ZodiosResponseByAlias<
  ZodApi,
  'generateVenueCheckIn'
>;
export type ValidateVenueCheckInResponse = ZodiosResponseByAlias<
  ZodApi,
  'validateVenueCheckIn'
>;
export type PerformVenueCheckInResponse = ZodiosResponseByAlias<
  ZodApi,
  'performVenueCheckIn'
>;
export type ToggleVenueStatusResponse = ZodiosResponseByAlias<
  ZodApi,
  'toggleVenueStatus'
>;

export function useGetVenues(args: {
  workspaceId: string;
  search?: string;
  pageIndex?: number;
  pageSize?: number;
  isActive?: boolean;
}): UseQueryResult<VenuesResponse | undefined, Error> {
  const { workspaceId, search, pageIndex, pageSize, isActive } = args;

  return apiHooks.useGetVenues({
    params: { workspaceId },
    queries: {
      search,
      pageIndex,
      pageSize,
      isActive,
    },
  });
}

export function useGetMyVenues(args: {
  workspaceId: string;
  search?: string;
  pageIndex?: number;
  pageSize?: number;
}): UseQueryResult<MyVenuesResponse | undefined, Error> {
  const { workspaceId, search, pageIndex, pageSize } = args;

  return apiHooks.useGetMyVenues({
    params: { workspaceId },
    queries: {
      search,
      pageIndex,
      pageSize,
    },
  });
}

export function useGenerateVenueInvitation(): UseMutationResult<
  GenerateVenueInvitationResponse,
  Error,
  { workspaceId: string; venueId: string }
> {
  return useMutation({
    mutationFn: ({ workspaceId, venueId }) =>
      apiClient.generateVenueInvitation(undefined, {
        params: { workspaceId, venueId },
      }),
  });
}

export function useValidateVenueInvitation(
  token: string,
  workspaceId: string,
  enabled = true
): UseQueryResult<ValidateVenueInvitationResponse | undefined, Error> {
  return apiHooks.useValidateVenueInvitation(
    { params: { token }, queries: { workspaceId } },
    { enabled }
  );
}

export function useAcceptVenueInvitation(): UseMutationResult<
  AcceptVenueInvitationResponse,
  Error,
  { token: string; workspaceId: string }
> {
  return useMutation({
    mutationFn: ({ token, workspaceId }) =>
      apiClient.acceptVenueInvitation(
        { workspaceId },
        {
          params: { token },
        }
      ),
  });
}

export function useGenerateVenueCheckIn(): UseMutationResult<
  GenerateVenueCheckInResponse,
  Error,
  { workspaceId: string; venueId: string }
> {
  return useMutation({
    mutationFn: ({ workspaceId, venueId }) =>
      apiClient.generateVenueCheckIn(undefined, {
        params: { workspaceId, venueId },
      }),
  });
}

export function useValidateVenueCheckIn(
  token: string,
  enabled = true
): UseQueryResult<ValidateVenueCheckInResponse | undefined, Error> {
  return apiHooks.useValidateVenueCheckIn({ params: { token } }, { enabled });
}

export function usePerformVenueCheckIn(): UseMutationResult<
  PerformVenueCheckInResponse,
  Error,
  { token: string }
> {
  return useMutation({
    mutationFn: ({ token }) =>
      apiClient.performVenueCheckIn(undefined, {
        params: { token },
      }),
  });
}

export function useToggleVenueStatus(): UseMutationResult<
  ToggleVenueStatusResponse,
  Error,
  { workspaceId: string; venueId: string; isActive: boolean }
> {
  return useMutation({
    mutationFn: ({ workspaceId, venueId, isActive }) =>
      apiClient.toggleVenueStatus(
        { isActive },
        {
          params: { workspaceId, venueId },
        }
      ),
  });
}

export function useGetVenuesOfUser(params: {
  userId: string;
  enabled?: boolean;
}): UseQueryResult<DbVenue[] | undefined, Error> {
  return apiHooks.useGetVenuesOfUser(
    {
      params: { userId: params.userId },
    },
    {
      enabled: params?.enabled !== undefined ? params.enabled : true,
    }
  );
}

export function useGetVenueById(params: {
  venueId: string;
  enabled?: boolean;
}): UseQueryResult<DbVenue | undefined, Error> {
  return apiHooks.useGetVenueById(
    {
      params: { venueId: params.venueId },
    },
    {
      enabled: params?.enabled !== undefined ? params.enabled : true,
    }
  );
}

export function useUpdateVenueById(
  ...params: Parameters<typeof apiHooks.useUpdateVenueById>
): ReturnType<typeof apiHooks.useUpdateVenueById> {
  return apiHooks.useUpdateVenueById(...params);
}
