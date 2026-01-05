import type { UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { ZodiosResponseByAlias } from '@zodios/core';

import type { StorageProvider } from '@/api/enums';

import type { ZodApi } from './zodios';
import { apiHooks } from './zodios';

type UseGetFileProps = {
  id: string;
  provider?: StorageProvider;
};

/* Utility types required for correct inference, otherwise zodios get query returns data: unknown */
type GetFileQueryResult = UseQueryResult<
  ZodiosResponseByAlias<ZodApi, 'getFile'>,
  Error
>;

type UseGetFileQueryOptions = UseQueryOptions<
  ZodiosResponseByAlias<ZodApi, 'getFile'>,
  Error
>;

export function useGetFile(
  { id, provider }: UseGetFileProps,
  options: UseGetFileQueryOptions = {}
): GetFileQueryResult {
  return apiHooks.useGetFile(
    { params: { id }, queries: { provider } },
    options
  );
}

export function useDeleteFile(
  ...params: Parameters<typeof apiHooks.useDeleteFile>
): ReturnType<typeof apiHooks.useDeleteFile> {
  return apiHooks.useDeleteFile(...params);
}

export function useUploadFile(
  ...params: Parameters<typeof apiHooks.useUploadFile>
): ReturnType<typeof apiHooks.useUploadFile> {
  return apiHooks.useUploadFile(...params);
}

/**
 * Returns the queryKey (url path) for the endpoint used to upload the file in vercel
 */
export function getUploadFileVercelPath(): string {
  return (apiHooks.getKeyByAlias('uploadFileVercelBlob')[0] as { path: string })
    .path;
}
