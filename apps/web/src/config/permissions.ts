import { UserRoleEnum } from '@meltstudio/types';

export const permissionsConfig = {
  roleAccessMap: {
    [UserRoleEnum.SUPER_ADMIN]: [
      '/admin',
      '/',
      '/admin/[model]',
      '/admin/[model]/[id]',
      '/admin/[model]/create',
    ],
    [UserRoleEnum.MEMBER]: ['/settings', '/'],
    [UserRoleEnum.ADMIN]: ['/'],
  },
};
