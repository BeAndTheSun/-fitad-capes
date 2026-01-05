import type { UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type {
  ZodiosBodyByAlias,
  ZodiosPathParamByAlias,
  ZodiosResponseByAlias,
} from '@zodios/core';

import type { ZodApi } from './zodios';
import { apiHooks } from './zodios';

export type FeatureFlag = ZodiosResponseByAlias<ZodApi, 'getFeatureFlags'>;

export function useGetFeatureFlags(args: {
  workspaceId: string;
  enabled?: boolean;
}): UseQueryResult<FeatureFlag | undefined, Error> {
  const { workspaceId, enabled } = args;
  const checkEnabled = enabled !== undefined ? enabled : true;

  return apiHooks.useGetFeatureFlags(
    { params: { workspaceId } },
    {
      enabled: !!workspaceId && checkEnabled,
    }
  );
}

export type CreateFeatureFlag = ZodiosBodyByAlias<ZodApi, 'createFeatureFlag'>;

type ApihooksType = typeof apiHooks;

export function useCreateFeatureFlag(): ReturnType<
  typeof apiHooks.useCreateFeatureFlag
> {
  return apiHooks.useCreateFeatureFlag();
}

export function useToggleFeatureFlag(
  ...params: Parameters<ApihooksType['useToggleFeatureFlag']>
): ReturnType<ApihooksType['useToggleFeatureFlag']> {
  return apiHooks.useToggleFeatureFlag(...params);
}

export function useDeleteFeatureFlag(
  ...params: Parameters<ApihooksType['useDeleteFeatureFlag']>
): ReturnType<ApihooksType['useDeleteFeatureFlag']> {
  return apiHooks.useDeleteFeatureFlag(...params);
}

export type UserFeatureFlag = ZodiosResponseByAlias<
  ZodApi,
  'getUsersWithFeatureFlag'
>;
type UseGetUsersWithFeatureFlagReturn = UseQueryResult<
  UserFeatureFlag | undefined,
  Error
>;

export function useGetUsersWithFeatureFlag(
  args: {
    params: ZodiosPathParamByAlias<ZodApi, 'getUsersWithFeatureFlag'>;
  },
  options?: UseQueryOptions<UserFeatureFlag | undefined, Error>
): UseGetUsersWithFeatureFlagReturn {
  return apiHooks.useGetUsersWithFeatureFlag({ params: args.params }, options);
}

export function useAddUserFeatureFlag(
  ...params: Parameters<ApihooksType['useAddUserFeatureFlag']>
): ReturnType<ApihooksType['useAddUserFeatureFlag']> {
  return apiHooks.useAddUserFeatureFlag(...params);
}

export function useToggleUserFeatureFlag(
  ...params: Parameters<ApihooksType['useToggleUserFeatureFlag']>
): ReturnType<ApihooksType['useToggleUserFeatureFlag']> {
  return apiHooks.useToggleUserFeatureFlag(...params);
}

export function useDeleteUserFeatureFlag(
  ...params: Parameters<ApihooksType['useDeleteUserFeatureFlag']>
): ReturnType<ApihooksType['useDeleteUserFeatureFlag']> {
  return apiHooks.useDeleteUserFeatureFlag(...params);
}
