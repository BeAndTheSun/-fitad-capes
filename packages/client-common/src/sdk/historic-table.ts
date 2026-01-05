import type { UseQueryResult } from '@tanstack/react-query';
import type { ZodiosResponseByAlias } from '@zodios/core';

import type { ZodApi } from './zodios';
import { apiHooks } from './zodios';

export type HistoricTable = ZodiosResponseByAlias<ZodApi, 'getHistoricTable'>;

export function useGetHistoricTable(): UseQueryResult<
  HistoricTable | undefined,
  Error
> {
  return apiHooks.useGetHistoricTable();
}

export type HistoricActionDescription = ZodiosResponseByAlias<
  ZodApi,
  'getHistoricActionDescription'
>;

export function useGetHistoricActionDescription(args: {
  id: string;
}): UseQueryResult<HistoricActionDescription | undefined, Error> {
  return apiHooks.useGetHistoricActionDescription(
    {
      params: {
        id: args.id,
      },
    },
    {
      enabled: !!args.id,
    }
  );
}
