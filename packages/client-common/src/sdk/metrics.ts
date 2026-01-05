import type { UseQueryResult } from '@tanstack/react-query';
import type { ZodiosBodyByAlias, ZodiosResponseByAlias } from '@zodios/core';

import type { ZodApi } from './zodios';
import { apiHooks } from './zodios';

export type Metric = ZodiosResponseByAlias<ZodApi, 'fetchMetrics'>;

export function useFetchMetrics(
  body: ZodiosBodyByAlias<ZodApi, 'fetchMetrics'>
): UseQueryResult<Metric | undefined> {
  return apiHooks.useFetchMetrics(body);
}
