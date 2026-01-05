import type { AnyModelType } from '@meltstudio/zod-schemas';
import { getModelSchema } from '@meltstudio/zod-schemas';
import type { UseQueryResult } from '@tanstack/react-query';
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ZodiosResponseByAlias } from '@zodios/core';
import { z } from 'zod';

import type { ZodApi } from './zodios';
import { apiClient, apiHooks } from './zodios';

export function useGetRecords<T extends AnyModelType>({
  model,
  enabled,
}: {
  model: string;
  enabled?: boolean;
}): UseQueryResult<T[] | undefined, Error> {
  const schema = getModelSchema(model);
  return useQuery(
    ['getRecords', model],
    async () => {
      if (model) {
        // Fetch data from API
        const response = await apiClient.getRecords({ params: { model } });
        // Validate the response using the selected schema
        const result = z.array(schema).safeParse(response);

        if (result.success) {
          return result.data;
        }
        if (result.error instanceof z.ZodError) {
          // eslint-disable-next-line no-console
          console.error(result.error.errors);
        }
        throw new Error('Invalid records format');
      }
      return [];
    },
    {
      enabled,
    }
  );
}

export function useGetRecord(
  model: string,
  id: string
): UseQueryResult<AnyModelType | undefined, Error> {
  const schema = getModelSchema(model);
  return useQuery(['getRecord', model, id], async () => {
    if (model) {
      // Fetch data from API
      const response = await apiClient.getRecord({ params: { model, id } });
      // Validate the response using the selected schema
      const result = schema.safeParse(response);

      if (result.success) {
        return result.data;
      }
      throw new Error('Invalid record format');
    }
    return [];
  });
}

export function useUpdateRecord(
  ...params: Parameters<typeof apiHooks.useUpdateRecord>
): ReturnType<typeof apiHooks.useUpdateRecord> {
  return apiHooks.useUpdateRecord(...params);
}

export function useDeleteRecord({
  model,
  id,
}: {
  model: string;
  id: string;
}): ReturnType<typeof apiHooks.useDeleteRecord> {
  const queryClient = useQueryClient();
  return apiHooks.useDeleteRecord(
    {
      params: { model, id },
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(['getRecords', model]);
      },
    }
  );
}

export function useCreateRecord(
  ...params: Parameters<typeof apiHooks.useCreateRecord>
): ReturnType<typeof apiHooks.useCreateRecord> {
  return apiHooks.useCreateRecord(...params);
}

export function useUpdateGTMId(
  ...params: Parameters<typeof apiHooks.useUpdateGTMId>
): ReturnType<typeof apiHooks.useUpdateGTMId> {
  return apiHooks.useUpdateGTMId(...params);
}

export type ModelRelation = ZodiosResponseByAlias<ZodApi, 'getModelRelation'>;

export function useGetModelRelation({
  model,
  relation,
}: {
  model: string;
  relation?: string;
}): UseQueryResult<ModelRelation | undefined, Error> {
  return useQuery(
    ['getModelRelation', relation],
    async () => {
      if (relation) {
        // Fetch data from API
        const response = await apiClient.getModelRelation({
          params: { model, relation },
        });

        return response;
      }
      return [];
    },
    {
      enabled: !!relation,
    }
  );
}

export function useGetModelRelations({
  model,
  relations,
}: {
  model: string;
  relations: string[];
}): UseQueryResult<
  {
    id: string;
    label: string;
  }[],
  unknown
>[] {
  return useQueries({
    queries: relations.map((relation) => ({
      queryKey: ['getModelRelation', relation],
      queryFn: async (): Promise<ModelRelation> => {
        // Fetch data from API
        const response = await apiClient.getModelRelation({
          params: { model, relation },
        });
        return response;
      },
      enabled: !!relation,
    })),
  });
}
