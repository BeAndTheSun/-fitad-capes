import type { UseQueryResult } from '@tanstack/react-query';

import { apiHooks } from './zodios';

export type UserPersonalData = {
  fullName: string;
  phoneNumber: string;
  fitnessGoal: string;
  sponsoring: string;
};

export function useCreateUpdateUserPersonalData(
  ...params: Parameters<typeof apiHooks.useUpdateUserPersonalData>
): ReturnType<typeof apiHooks.useUpdateUserPersonalData> {
  return apiHooks.useUpdateUserPersonalData(...params);
}

export function useGetUserPersonalData(params: {
  userId: string;
  enabled?: boolean;
}): UseQueryResult<UserPersonalData | undefined, Error> {
  return apiHooks.useGetUserPersonalData(
    {
      params: { userId: params.userId },
    },
    {
      enabled: params?.enabled !== undefined ? params.enabled : true,
    }
  );
}
