import { apiDef } from '@meltstudio/api/def';
import { isErrorFromAlias, isErrorFromPath } from '@zodios/core';
import type {
  Aliases,
  ZodiosPathsByMethod,
} from '@zodios/core/lib/zodios.types';

import type { ApiCommonErrorType } from '@/api/routers/def-utils';

type HttpMethod = 'get' | 'post' | 'put' | 'delete';

const isValidMethod = (method: string): method is HttpMethod => {
  return ['get', 'post', 'put', 'delete'].includes(method);
};

const formatZodiosError = (
  alias: Aliases<typeof apiDef>,
  error: Error | null,
  fromPath?: {
    method: HttpMethod;
    path: ZodiosPathsByMethod<typeof apiDef, 'post'>;
  }
): ApiCommonErrorType | null => {
  if (fromPath && isValidMethod(fromPath.method)) {
    const formatPath = isErrorFromPath(
      apiDef,
      fromPath.method,
      fromPath.path,
      error
    );

    if (formatPath) {
      const { response } = error;
      return response.data;
    }
  }

  const format = isErrorFromAlias(apiDef, alias, error);

  if (format) {
    const { response } = error;
    return response.data;
  }

  if (error) {
    return {
      error: error.message,
      code: error.stack,
    };
  }

  return null;
};

export { formatZodiosError };
