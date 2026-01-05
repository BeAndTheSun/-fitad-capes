import { UserRoleEnum } from '@meltstudio/types';

import { permissionsConfig } from '@/config/permissions';

const doesRoleHaveAccessToURL = (role: string, url: string): boolean => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
  if (role === UserRoleEnum.ADMIN) {
    return true;
  }
  const roleAccessMap = permissionsConfig.roleAccessMap as Record<
    string,
    string[]
  >;
  const accessibleRoutes = roleAccessMap[role] ?? [];
  return accessibleRoutes.some((route) => {
    // Create a regex from the route by replacing dynamic segments
    const regexPattern = route.replace(/\[.*?\]/g, '[^/]+').replace('/', '\\/');
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(url);
  });
};

export { doesRoleHaveAccessToURL };
