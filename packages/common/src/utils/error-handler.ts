import * as Sentry from '@sentry/node';
import axios from 'axios';

import type {
  HttpHandlerError,
  HttpHandlerResult,
} from '@/common/types/error-handler';

export function processAxiosError(error: unknown): HttpHandlerError {
  if (error instanceof Error) {
    return {
      code: 'request_error',
      message: error.message,
    };
  }

  if (!axios.isAxiosError(error)) {
    throw error;
  }

  if (error.response != null) {
    return {
      statusCode: error.response.status,
      code: 'response_error',
      message: `Bad response from ${error.response.config.url}: ${error.response.status}`,
      response: error.response.data,
    };
  }

  if (error.request != null) {
    return {
      code: 'request_error',
      message: 'Could not send request',
    };
  }

  throw error;
}

export function errorHandler<T>({
  transactionName,
  error,
  body,
}: {
  transactionName: string;
  body?: Record<string, unknown>;
  error: unknown;
}): HttpHandlerResult<T> {
  const parsedError = processAxiosError(error);
  Sentry.captureException(
    `${transactionName} error: ${parsedError.message || 'Unknown'}`,
    {
      contexts: {
        body,
        error:
          error instanceof Error ? { ...error, ...parsedError } : parsedError,
      },
    }
  );

  return {
    success: false,
    error: parsedError,
  };
}
