import type { ZodiosBodyByAlias } from '@zodios/core';

import type { ZodApi } from './zodios';
import { apiHooks } from './zodios';

export type CreateUserWorkspace = ZodiosBodyByAlias<
  ZodApi,
  'createUserWorkspace'
>;

export function useCreateUserWorkspace(): ReturnType<
  typeof apiHooks.useCreateUserWorkspace
> {
  return apiHooks.useCreateUserWorkspace();
}
