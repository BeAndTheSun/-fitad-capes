import { UserRoleEnum } from '@meltstudio/types';
import { useRouter } from 'next/router';
import { signOut, useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { useCallback, useMemo } from 'react';

import type {
  UserContextType,
  UserWorkspace,
} from '@/components/user/user-context';
import { useSessionUser } from '@/components/user/user-context';
import { useClientConfig } from '@/config/client';
import { sidebarNavAdmin, useNavAdmin } from '@/config/super-admin';
import { useAdminViewAs } from '@/hooks/use-admin-view-as';
import { useAdminWorkspaces } from '@/hooks/use-admin-workspaces';
import type { MainNavItem } from '@/ui/main-nav';
import type { SidebarNavItem } from '@/ui/sidebar-nav';
import { getUserRoleName } from '@/utils/localization';

export type DashboardLayoutData = {
  user: UserContextType['user'];
  selectedWorkspace: UserContextType['selectedWorkspace'];
  workspaces: UserContextType['workspaces'];
  isLoading: boolean;
  isSuperAdmin: boolean;
  isAdminPath: boolean;
  isProfilePath: boolean;
  navItems: MainNavItem[];
  sidebarItems: SidebarNavItem[];
  clientConfig: ReturnType<typeof useClientConfig>;
  handleSignOutClick: () => Promise<void>;
  viewAsRole: UserRoleEnum | undefined | null;
  userAccountLabel: string;
  showSidebar: boolean;
  workspaceSelectorProps: {
    workspaces: { id: string; name: string; role: string }[];
    selectedWorkspace: UserWorkspace | null;
    onSelectWorkspace: (value: string) => Promise<void>;
    isLoading: boolean;
  } | null;
  status: 'authenticated' | 'loading' | 'unauthenticated';
};

export const useDashboardLayout = (): DashboardLayoutData => {
  const { t } = useTranslation();
  const { asPath, replace, locale } = useRouter();
  const { user, selectedWorkspace, workspaces, isLoading, isSuperAdmin } =
    useSessionUser();
  const { workspaces: allWorkspaces } = useAdminWorkspaces();
  const {
    data: session,
    update,
    status,
  } = useSession({
    required: true,
    async onUnauthenticated() {
      await replace('/auth/sign-in');
    },
  });
  const clientConfig = useClientConfig();
  const { viewAsSidebarItems, viewAsRole } = useAdminViewAs();
  const navAdmin = useNavAdmin();

  const handleSignOutClick = async (): Promise<void> => {
    let prefix = '';
    if (locale) prefix = `/${locale}`;
    await signOut({ callbackUrl: `${prefix}/auth/sign-in` });
  };

  const isAdminPath = useMemo(() => {
    return asPath.startsWith('/super-admin');
  }, [asPath]);

  const isProfilePath = useMemo(() => {
    return asPath.startsWith('/profile');
  }, [asPath]);

  const navItems = useMemo(() => {
    if (user == null) {
      return [];
    }
    if (isSuperAdmin) {
      return navAdmin;
    }
    return clientConfig.nav.items;
  }, [user, isSuperAdmin, clientConfig.nav.items, navAdmin]);

  const sidebarItems = useMemo(() => {
    if (user == null) {
      return [];
    }
    if (isSuperAdmin && viewAsRole) {
      return viewAsSidebarItems;
    }
    if (isAdminPath) {
      return sidebarNavAdmin;
    }
    if (isProfilePath) {
      return clientConfig.nav.profileSidebarItems;
    }
    return clientConfig.nav.sidebarItems;
  }, [
    clientConfig.nav.profileSidebarItems,
    clientConfig.nav.sidebarItems,
    isAdminPath,
    isProfilePath,
    user,
    isSuperAdmin,
    viewAsRole,
    viewAsSidebarItems,
  ]);

  const availableWorkspaces = useMemo(() => {
    if (!isSuperAdmin) {
      return workspaces;
    }
    return allWorkspaces.map((w) => ({
      id: w.id,
      name: w.name,
      role: workspaces.find((uw) => uw.id === w.id)?.role ?? 'admin',
    }));
  }, [isSuperAdmin, allWorkspaces, workspaces]);

  const handleWorkspaceSelect = useCallback(
    async (value: string): Promise<void> => {
      await update({
        user: {
          ...session?.user,
          selectedWorkspace: {
            id: value,
            name: availableWorkspaces.find((w) => w.id === value)?.name,
            role: availableWorkspaces.find((w) => w.id === value)?.role,
          },
        },
      });
    },
    [update, session, availableWorkspaces]
  );

  const userAccountLabel = useMemo(() => {
    if (viewAsRole) {
      return viewAsRole === UserRoleEnum.ADMIN
        ? t('Trainer')
        : t('Super Participant');
    }
    return selectedWorkspace?.role
      ? getUserRoleName(t, selectedWorkspace.role as UserRoleEnum)
      : 'User';
  }, [viewAsRole, selectedWorkspace, t]);

  const showSidebar = sidebarItems.length > 0;
  const showWorkspaceSelector = !isAdminPath && !isProfilePath;

  const workspaceSelectorProps = useMemo(() => {
    if (!showWorkspaceSelector) return null;
    return {
      workspaces: availableWorkspaces,
      selectedWorkspace,
      onSelectWorkspace: handleWorkspaceSelect,
      isLoading: false,
    };
  }, [
    showWorkspaceSelector,
    availableWorkspaces,
    selectedWorkspace,
    handleWorkspaceSelect,
  ]);

  return {
    user,
    selectedWorkspace,
    workspaces,
    isLoading:
      isLoading || clientConfig.isLoading || status !== 'authenticated',
    isSuperAdmin,
    isAdminPath,
    isProfilePath,
    navItems,
    sidebarItems,
    clientConfig,
    handleSignOutClick,
    viewAsRole,
    userAccountLabel,
    showSidebar,
    workspaceSelectorProps,
    status,
  };
};
