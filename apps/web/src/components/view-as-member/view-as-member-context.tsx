import { UserRoleEnum } from '@meltstudio/types';
import type { FC, PropsWithChildren } from 'react';
import { createContext, useContext, useMemo, useState } from 'react';

export type ViewAsRole =
  | UserRoleEnum.ADMIN
  | UserRoleEnum.MEMBER
  | UserRoleEnum.VENUE_OWNER
  | null;

type ViewAsMemberContextType = {
  /**
   * Whether the super admin is currently viewing as another role
   */
  isViewingAsRole: boolean;
  /**
   * The role being viewed as (ADMIN for trainer, MEMBER for super participant)
   */
  viewAsRole: ViewAsRole;
  /**
   * Toggle the view-as-role mode
   */
  toggleViewAsRole: () => void;
  /**
   * Enable view-as-role mode with a specific role
   */
  enableViewAsRole: (role: UserRoleEnum.ADMIN | UserRoleEnum.MEMBER) => void;
  /**
   * Disable view-as-role mode
   */
  disableViewAsRole: () => void;
  /**
   * Set the role to view as
   */
  setViewAsRole: (role: ViewAsRole) => void;
  /**
   * The workspace ID to view as (if any)
   */
  viewAsWorkspaceId: string | null;
  /**
   * Set the workspace ID to view as
   */
  setViewAsWorkspaceId: (workspaceId: string | null) => void;
  /**
   * @deprecated Use isViewingAsRole instead
   */
  isViewingAsMember: boolean;
  /**
   * @deprecated Use viewAsRole instead
   */
  viewAsMemberWorkspaceId: string | null;
  /**
   * @deprecated Use setViewAsWorkspaceId instead
   */
  setViewAsMemberWorkspaceId: (workspaceId: string | null) => void;
};

const ViewAsMemberContext = createContext<ViewAsMemberContextType | null>(null);

export const ViewAsMemberProvider: FC<PropsWithChildren> = ({ children }) => {
  const [viewAsRole, setViewAsRole] = useState<ViewAsRole>(null);
  const [viewAsWorkspaceId, setViewAsWorkspaceId] = useState<string | null>(
    null
  );

  const isViewingAsRole = viewAsRole !== null;

  const enableViewAsRole = (
    role: UserRoleEnum.ADMIN | UserRoleEnum.MEMBER
  ): void => {
    setViewAsRole(role);
  };

  const disableViewAsRole = (): void => {
    setViewAsRole(null);
    setViewAsWorkspaceId(null);
  };

  const value = useMemo<ViewAsMemberContextType>(() => {
    const toggleViewAsRole = (): void => {
      if (isViewingAsRole) {
        // Disable view-as mode
        setViewAsRole(null);
        setViewAsWorkspaceId(null);
      } else {
        // Enable view-as mode with default role (MEMBER)
        // Note: This requires a workspace to be set separately via setViewAsWorkspaceId
        // For a complete toggle, use enableViewAsRole with both role and workspace
        setViewAsRole(UserRoleEnum.MEMBER);
      }
    };

    return {
      isViewingAsRole,
      viewAsRole,
      toggleViewAsRole,
      enableViewAsRole,
      disableViewAsRole,
      setViewAsRole,
      viewAsWorkspaceId,
      setViewAsWorkspaceId,
      // Deprecated properties for backward compatibility
      isViewingAsMember: viewAsRole === UserRoleEnum.MEMBER,
      viewAsMemberWorkspaceId: viewAsWorkspaceId,
      setViewAsMemberWorkspaceId: setViewAsWorkspaceId,
    };
  }, [isViewingAsRole, viewAsRole, viewAsWorkspaceId]);

  return (
    <ViewAsMemberContext.Provider value={value}>
      {children}
    </ViewAsMemberContext.Provider>
  );
};

export const useViewAsMember = (): ViewAsMemberContextType => {
  const context = useContext(ViewAsMemberContext);
  if (!context) {
    throw new Error(
      'useViewAsMember must be used within a ViewAsMemberProvider'
    );
  }
  return context;
};
