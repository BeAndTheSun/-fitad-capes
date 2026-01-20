import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import type { DbVenueUserWithRelations } from '@/db/schema';

import { apiClient, apiHooks } from './zodios';

export type VenueUserStatus = 'joined' | 'checking' | 'completed' | 'failed';

export function useCreateVenueUser(
  ...params: Parameters<typeof apiHooks.useCreateVenueUser>
): ReturnType<typeof apiHooks.useCreateVenueUser> {
  return apiHooks.useCreateVenueUser(...params);
}

export function useGetMembersOfVenue(params: {
  venueId: string;
  enabled?: boolean;
}): UseQueryResult<DbVenueUserWithRelations[] | undefined, Error> {
  return apiHooks.useGetMembersOfVenue(
    {
      params: { venueId: params.venueId },
    },
    {
      enabled: params?.enabled !== undefined ? params.enabled : true,
    }
  );
}

export function useDeleteVenueUser(
  ...params: Parameters<typeof apiHooks.useDeleteVenueUser>
): ReturnType<typeof apiHooks.useDeleteVenueUser> {
  return apiHooks.useDeleteVenueUser(...params);
}

export function useUpdateVenueUserStatus(): UseMutationResult<
  { success: boolean; message: string },
  Error,
  {
    workspaceId: string;
    venueId: string;
    userId: string;
    status: VenueUserStatus;
  }
> {
  return useMutation({
    mutationFn: ({ workspaceId, venueId, userId, status }) =>
      apiClient.updateVenueUserStatus(
        { status },
        {
          params: { workspaceId, venueId, userId },
        }
      ),
  });
}
