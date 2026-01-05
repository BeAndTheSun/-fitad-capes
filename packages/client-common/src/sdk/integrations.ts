import type { IntegrationsKeys } from '@meltstudio/types';
import type { UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import type {
  ZodiosPathParamByAlias,
  ZodiosResponseByAlias,
} from '@zodios/core';

import { getWebhookUrlKey } from './webhooks';
import type { ZodApi } from './zodios';
import { apiHooks } from './zodios';

export function useSaveIntegrationKeys(
  args: {
    workspaceId: string;
    platform: IntegrationsKeys;
  },
  hooks: { onSuccess: () => Promise<void>; onError: (error: Error) => void }
): ReturnType<typeof apiHooks.useSaveIntegrationKeys> {
  const queryClient = useQueryClient();
  return apiHooks.useSaveIntegrationKeys(
    {
      params: {
        workspaceId: args.workspaceId,
        platform: args.platform,
      },
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(getWebhookUrlKey(args.workspaceId));
        await hooks.onSuccess();
      },
      onError: hooks.onError,
    }
  );
}

export type ListIntegrationKeys = ZodiosResponseByAlias<
  ZodApi,
  'listIntegrationKeys'
>;

type ListIntegrationKeysReturn = UseQueryResult<
  ListIntegrationKeys | undefined,
  Error
> & {
  invalidate: () => Promise<void>;
};

export function useListIntegrationKeys(
  args: {
    params: ZodiosPathParamByAlias<ZodApi, 'listIntegrationKeys'>;
  },
  options?: UseQueryOptions<ListIntegrationKeys | undefined, Error>
): ListIntegrationKeysReturn {
  return apiHooks.useListIntegrationKeys(
    {
      params: args.params,
    },
    options
  );
}
