import type { UseQueryResult } from '@tanstack/react-query';
import type { ZodiosBodyByAlias, ZodiosResponseByAlias } from '@zodios/core';

import type { ZodApi } from './zodios';
import { apiHooks } from './zodios';

export type CreateUserWorkspace = ZodiosBodyByAlias<
  ZodApi,
  'createUserWorkspace'
>;

export type TrainerResponse = ZodiosResponseByAlias<
  ZodApi,
  'getWorkspaceTrainer'
>;

export type MemberParticipationResponse = ZodiosResponseByAlias<
  ZodApi,
  'getMemberParticipation'
>;

export function useCreateUserWorkspace(): ReturnType<
  typeof apiHooks.useCreateUserWorkspace
> {
  return apiHooks.useCreateUserWorkspace();
}

export function useGetWorkspaceTrainer(args: {
  workspaceId: string;
  enabled?: boolean;
}): UseQueryResult<TrainerResponse | null | undefined, Error> {
  const { workspaceId, enabled = true } = args;

  return apiHooks.useGetWorkspaceTrainer({
    params: { workspaceId },
    enabled,
  });
}

export function useGetMemberParticipation(args: {
  workspaceId: string;
  enabled?: boolean;
}): UseQueryResult<MemberParticipationResponse | undefined, Error> {
  const { workspaceId, enabled = true } = args;

  return apiHooks.useGetMemberParticipation({
    params: { workspaceId },
    enabled,
  });
}
