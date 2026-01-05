import type { UserRoleEnum } from './auth';

export type MemberFiltersType = {
  id?: string;
  name?: string;
  email?: string;
  role?: UserRoleEnum;
  active?: string;
};
