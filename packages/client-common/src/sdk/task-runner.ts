import type { UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type {
  ZodiosPathParamByAlias,
  ZodiosResponseByAlias,
} from '@zodios/core';

import type { ZodApi } from './zodios';
import { apiHooks } from './zodios';

export const useExportDatabaseToCSV = (): ReturnType<
  typeof apiHooks.useExportDatabaseToCSV
> => {
  return apiHooks.useExportDatabaseToCSV();
};

export type AsyncTask = ZodiosResponseByAlias<ZodApi, 'getAsyncTask'>;

type GetAsyncTaskReturn = UseQueryResult<AsyncTask | undefined, Error>;

export const useGetAsyncTask = (args: {
  id: string | null;
  enabled?: boolean;
}): GetAsyncTaskReturn => {
  return apiHooks.useGetAsyncTask(
    { params: { taskId: args.id || '' } },
    {
      enabled: args.enabled !== false && !!args.id,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: false,
    }
  );
};

export const useExportModelToCSV = (
  modelName: string,
  email?: string
): ReturnType<typeof apiHooks.useExportModelToCSV> => {
  const args = {
    params: { modelName },
    data: { email: email ?? '' },
  };
  return apiHooks.useExportModelToCSV(args);
};

export type AllAsyncTasksType = ZodiosResponseByAlias<
  ZodApi,
  'getAllAsyncTasks'
>;
type UseGetAllAsyncTasksReturn = UseQueryResult<
  AllAsyncTasksType | undefined,
  Error
>;

export const useGetAllAsyncTasks = (
  options?: UseQueryOptions<AllAsyncTasksType | undefined, Error>
): UseGetAllAsyncTasksReturn => {
  return apiHooks.useGetAllAsyncTasks({}, options);
};

export type AllAsyncTasksByModelType = ZodiosResponseByAlias<
  ZodApi,
  'getAllAsyncTasksByModel'
>;

type UseGetAllAsyncTasksByModelReturn = UseQueryResult<
  AllAsyncTasksByModelType | undefined,
  Error
>;

export const useGetAllAsyncTasksByModel = (
  args: {
    params: ZodiosPathParamByAlias<ZodApi, 'getAllAsyncTasksByModel'>;
  },
  options?: UseQueryOptions<AllAsyncTasksByModelType | undefined, Error>
): UseGetAllAsyncTasksByModelReturn => {
  return apiHooks.useGetAllAsyncTasksByModel(
    {
      params: args.params,
    },
    options
  );
};
