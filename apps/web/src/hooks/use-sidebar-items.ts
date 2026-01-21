import { UserRoleEnum } from '@meltstudio/types';
import {
  FileTextIcon,
  LaptopIcon,
  LightningBoltIcon,
  PersonIcon,
} from '@radix-ui/react-icons';
import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';

import { useSessionUser } from '@/components/user/user-context';
import type { SidebarNavItem } from '@/ui/sidebar-nav';

type UseSidebarItemsOptions = {
  /**
   * Optional role override. If not provided, will use the role from the current workspace.
   */
  role?: UserRoleEnum | string | null;
  /**
   * Whether to include feature flag checks (for future extensibility)
   */
  includeFeatureFlags?: boolean;
};

/**
 * Hook to get sidebar items based on user role.
 * Returns the appropriate sidebar navigation items filtered by the user's role.
 *
 * @param options - Configuration options for the hook
 * @returns Array of sidebar navigation items based on the role
 *
 * @example
 * ```tsx
 * const sidebarItems = useSidebarItems();
 * // Returns items filtered by current workspace role
 *
 * const memberItems = useSidebarItems({ role: UserRoleEnum.MEMBER });
 * // Returns items for member role specifically
 * ```
 */
export function useSidebarItems(
  options: UseSidebarItemsOptions = {}
): SidebarNavItem[] {
  const { t } = useTranslation();
  const { selectedWorkspace, isVenueOwner } = useSessionUser();
  const { role: roleOverride } = options;

  // Determine the role to use
  const role = roleOverride ?? selectedWorkspace?.role ?? null;

  const sidebarItems = useMemo(() => {
    const items: SidebarNavItem[] = [
      {
        title: t('Dashboard'),
        href: '/',
        icon: LaptopIcon,
      },
    ];

    // Only show Super Participants and Venues for non-members (trainers/admins)
    if (role === UserRoleEnum.ADMIN) {
      items.push(
        {
          title: t('Super Participants'),
          href: '/super-participant',
          icon: PersonIcon,
        },
        {
          title: t('Venues'),
          href: '/venues',
          icon: LightningBoltIcon,
        }
      );
    }

    // My Venues is only available to super participants (MEMBER role)
    if (role === UserRoleEnum.MEMBER) {
      items.push({
        title: t('My Venues'),
        href: '/my-venues',
        icon: LightningBoltIcon,
      });
    }

    if (isVenueOwner) {
      items.push(
        {
          title: t('Manage Venues'),
          href: '/manage-venues',
          icon: LightningBoltIcon,
        },
        {
          title: t('Reports'),
          href: '/reports',
          icon: FileTextIcon,
        }
      );
    }

    return items;
  }, [t, role, isVenueOwner]);

  return sidebarItems;
}
