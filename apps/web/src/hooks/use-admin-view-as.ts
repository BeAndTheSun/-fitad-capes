import { UserRoleEnum } from '@meltstudio/types';
import { useMemo } from 'react';

import { useSessionUser } from '@/components/user/user-context';
import type { ViewAsRole } from '@/components/view-as-member/view-as-member-context';
import { useViewAsMember } from '@/components/view-as-member/view-as-member-context';
import { useSidebarItems } from '@/hooks/use-sidebar-items';
import type { SidebarNavItem } from '@/ui/sidebar-nav';

type UseAdminViewAs = {
  isSuperAdmin: boolean;
  isViewingAsRole: boolean;
  viewAsRole: ViewAsRole;
  viewAsWorkspaceId: string | null;
  effectiveWorkspaceId: string | null;
  effectiveRole: UserRoleEnum | null;
  viewAsSidebarItems: SidebarNavItem[];
  shouldShowMemberDashboard: boolean;
  shouldShowTrainerDashboard: boolean;
  shouldShowVenueOwnerDashboard: boolean;
  setViewAsRole: (role: ViewAsRole) => void;
  setViewAsWorkspaceId: (workspaceId: string) => void;
  disableViewAsRole: () => void;
};

/**
 * Custom hook for super admins to manage view-as functionality
 * Provides a convenient way to access view-as state and computed values
 */
export function useAdminViewAs(): UseAdminViewAs {
  const { isSuperAdmin, selectedWorkspace, user } = useSessionUser();
  const {
    isViewingAsRole,
    viewAsRole,
    viewAsWorkspaceId,
    setViewAsRole,
    setViewAsWorkspaceId,
    disableViewAsRole,
  } = useViewAsMember();

  // Get sidebar items for the role being viewed as
  const viewAsSidebarItems = useSidebarItems({
    role: viewAsRole ?? undefined,
  });

  // Determine the effective workspace ID
  // When viewing-as-member, use viewAsWorkspaceId if set, otherwise fall back to selectedWorkspace
  // This allows super admins to view-as-member in a different workspace than their selected one
  const effectiveWorkspaceId = useMemo(() => {
    if (isSuperAdmin && isViewingAsRole && viewAsWorkspaceId) {
      return viewAsWorkspaceId;
    }
    return selectedWorkspace?.id ?? null;
  }, [isSuperAdmin, isViewingAsRole, viewAsWorkspaceId, selectedWorkspace?.id]);

  // Determine the effective role
  const effectiveRole = useMemo(() => {
    if (isSuperAdmin && isViewingAsRole && viewAsRole) {
      return viewAsRole;
    }
    return (selectedWorkspace?.role as UserRoleEnum) ?? null;
  }, [isSuperAdmin, isViewingAsRole, viewAsRole, selectedWorkspace?.role]);

  // Check if should show member dashboard
  const shouldShowMemberDashboard = useMemo(() => {
    return (
      effectiveRole === UserRoleEnum.MEMBER ||
      (isSuperAdmin && isViewingAsRole && viewAsRole === UserRoleEnum.MEMBER)
    );
  }, [effectiveRole, isSuperAdmin, isViewingAsRole, viewAsRole]);

  // Check if should show trainer dashboard (for future use)
  const shouldShowTrainerDashboard = useMemo(() => {
    return (
      effectiveRole === UserRoleEnum.ADMIN ||
      (isSuperAdmin && isViewingAsRole && viewAsRole === UserRoleEnum.ADMIN)
    );
  }, [effectiveRole, isSuperAdmin, isViewingAsRole, viewAsRole]);

  const shouldShowVenueOwnerDashboard = useMemo(() => {
    // If viewing as a specific role, only show venue owner dashboard when viewing as VENUE_OWNER
    if (isSuperAdmin && isViewingAsRole) {
      return viewAsRole === UserRoleEnum.VENUE_OWNER;
    }

    // Otherwise, check if user is a venue owner or has VENUE_OWNER role
    return (
      effectiveRole === UserRoleEnum.VENUE_OWNER ||
      (user?.isVenueOwner ?? false)
    );
  }, [
    effectiveRole,
    isSuperAdmin,
    isViewingAsRole,
    viewAsRole,
    user?.isVenueOwner,
  ]);

  return {
    // State
    isViewingAsRole,
    viewAsRole,
    viewAsWorkspaceId,
    isSuperAdmin,

    // Computed values
    effectiveWorkspaceId,
    effectiveRole,
    viewAsSidebarItems,
    shouldShowMemberDashboard,
    shouldShowTrainerDashboard,
    shouldShowVenueOwnerDashboard,

    // Actions
    setViewAsRole,
    setViewAsWorkspaceId,
    disableViewAsRole,
  };
}
