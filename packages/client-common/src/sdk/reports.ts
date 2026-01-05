import { apiHooks } from './zodios';

type ApiHooksType = typeof apiHooks;

export function useGenerateReport(
  ...params: Parameters<ApiHooksType['useGenerateReport']>
): ReturnType<ApiHooksType['useGenerateReport']> {
  return apiHooks.useGenerateReport(...params);
}
