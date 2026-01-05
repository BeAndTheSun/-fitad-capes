import { apiDef } from '@meltstudio/api/def';
import { QueryClient } from '@tanstack/react-query';
import { Zodios } from '@zodios/core';
import { ZodiosHooks } from '@zodios/react';
import type { AxiosError } from 'axios';
import axios, { isAxiosError } from 'axios';

import {
  formatGoogleAnalyticsData,
  pushToWindow,
} from '@/client-common/utils/google-analytics';

const axiosInstance = axios.create();

export const apiClient = new Zodios('/', apiDef, {
  axiosInstance,
});

export type ZodApi = typeof apiDef;
export const apiHooks = new ZodiosHooks('api', apiClient);

function isApiErrorWithStatus(
  error: unknown,
  status: number
): error is AxiosError {
  if (isAxiosError(error)) {
    if (error.response != null && error.response.status === status) {
      return true;
    }
    return false;
  }

  return false;
}

// Add a request interceptor
axiosInstance.interceptors.request.use((config) => {
  const dontSentToGA = (config.headers.dontSentToGA as string) ?? '';
  const eventName = formatGoogleAnalyticsData(
    config.method ?? '',
    config.url ?? '',
    dontSentToGA
  );
  if (eventName) {
    pushToWindow(eventName, config);
  }
  return config;
});

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // avoid retrying on 404 errors
        retry: (failureCount, error): boolean => {
          if (isApiErrorWithStatus(error, 404)) {
            return false;
          }
          return failureCount < 3;
        },
      },
    },
  });
}
