import type { QueryKey, UseQueryResult } from '@tanstack/react-query';
import type { ZodiosResponseByAlias } from '@zodios/core';

import type { ZodApi } from './zodios';
import { apiHooks } from './zodios';

type ApiHooksType = typeof apiHooks;

export function getWebhookUrlKey(workspaceId: string): QueryKey {
  return apiHooks.getKeyByPath<'get', '/api/webhooks/:workspaceId'>(
    'get',
    '/api/webhooks/:workspaceId',
    {
      params: { workspaceId },
    }
  );
}

export function useCreateWebhook(
  ...params: Parameters<ApiHooksType['useCreateWebhook']>
): ReturnType<ApiHooksType['useCreateWebhook']> {
  return apiHooks.useCreateWebhook(...params);
}

export type ListAllWebhooks = ZodiosResponseByAlias<ZodApi, 'listAllWebhooks'>;

export function useListAllWebhooks(params?: {
  workspaceId: string;
  filters?: {
    search?: string;
  };
  pagination?: {
    pageIndex?: number;
    pageSize?: number;
  };
  sorting?: {
    column: 'name' | 'url';
    order: 'asc' | 'desc';
  }[];
}): UseQueryResult<ListAllWebhooks | undefined> {
  return apiHooks.useListAllWebhooks({
    queries: {
      query: {
        filters: params?.filters,
        sorting: params?.sorting,
      },
    },
    params: {
      pagination: params?.pagination,
      workspaceId: params?.workspaceId as string,
    },
  });
}

export const useDeleteWebhook = (
  ...params: Parameters<typeof apiHooks.useDeleteWebhook>
): ReturnType<typeof apiHooks.useDeleteWebhook> => {
  return apiHooks.useDeleteWebhook(...params);
};

export type WebhookEvent = ZodiosResponseByAlias<ZodApi, 'getWebhookEvents'>;

export function useGetWebhookEvents(params?: {
  webhookId: string;
  filters?: {
    search?: string;
  };
  pagination?: {
    pageIndex?: number;
    pageSize?: number;
  };
  sorting?: {
    column: 'status' | 'eventType' | 'eventTableName';
    order: 'asc' | 'desc';
  }[];
}): UseQueryResult<WebhookEvent | undefined> {
  return apiHooks.useGetWebhookEvents({
    queries: {
      query: {
        filters: params?.filters,
        sorting: params?.sorting,
      },
    },
    params: {
      pagination: params?.pagination,
      webhookId: params?.webhookId as string,
    },
  });
}
