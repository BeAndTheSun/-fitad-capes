import type { UseQueryResult } from '@tanstack/react-query';
import type { ZodiosBodyByAlias, ZodiosResponseByAlias } from '@zodios/core';

import type { ZodApi } from './zodios';
import { apiHooks } from './zodios';

export function useUpdateWorkspaceProfile(
  ...params: Parameters<typeof apiHooks.useUpdateWorkspaceProfile>
): ReturnType<typeof apiHooks.useUpdateWorkspaceProfile> {
  return apiHooks.useUpdateWorkspaceProfile(...params);
}

export function useDeleteWorkspaceProfile(
  ...params: Parameters<typeof apiHooks.useDeleteWorkspaceProfile>
): ReturnType<typeof apiHooks.useDeleteWorkspaceProfile> {
  return apiHooks.useDeleteWorkspaceProfile(...params);
}

export type CreateWorkspaceProfile = ZodiosBodyByAlias<
  ZodApi,
  'createWorkspaceProfile'
>;

export function useCreateWorkspaceProfile(): ReturnType<
  typeof apiHooks.useCreateWorkspaceProfile
> {
  return apiHooks.useCreateWorkspaceProfile();
}

export type WorkspaceProfile = ZodiosResponseByAlias<
  ZodApi,
  'getWorkspaceProfile'
>;

export function useGetWorkspaceProfile(args: {
  workspaceId: string;
}): UseQueryResult<WorkspaceProfile | undefined, Error> {
  const { workspaceId } = args;

  return apiHooks.useGetWorkspaceProfile({ params: { workspaceId } });
}
