import { FeatureFlagsProvider } from '@meltstudio/feature-flags';
import { cn } from '@meltstudio/theme';
import {
  LanguageSelector,
  MainNav,
  SidebarNav,
  UserAccountNav,
} from '@meltstudio/ui';
import { useRouter } from 'next/router';
import { signOut, useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';

import type { UserRoleEnum } from '@/common-types/index';
import { Loading } from '@/components/common/loading';
import { NoAccess } from '@/components/no-access';
import { ThemeToggle } from '@/components/theme-toggle';
import { useSessionUser } from '@/components/user/user-context';
import { useClientConfig } from '@/config/client';
import { sidebarNavAdmin, useNavAdmin } from '@/config/super-admin';
import { getUserRoleName } from '@/utils/localization';

export const DashboardLayout: React.FC<React.PropsWithChildren> = (props) => {
  const { t } = useTranslation();
  const { children } = props;
  const { asPath, replace, locale } = useRouter();
  const { user, selectedWorkspace, workspaces, isLoading, isSuperAdmin } =
    useSessionUser();
  const {
    data: session,
    update,
    status,
  } = useSession({
    required: true,
    // Redirect to sign-in page if user is not authenticated, we need do this here because next-i18next overrides the middleware
    // and next-auth doesn't redirect to the login page if the user is not authenticated.
    // Remove this if you don't use next-i18next
    async onUnauthenticated() {
      await replace('/auth/sign-in');
    },
  });
  const isAdmin = selectedWorkspace?.role === 'admin';
  const clientConfig = useClientConfig(isAdmin);

  const handleSignOutClick = async (): Promise<void> => {
    let prefix = '';
    if (locale) prefix = `/${locale}`;
    await signOut({ callbackUrl: `${prefix}/auth/sign-in` });
  };

  // Check admin path for sidebar
  const isAdminPath = useMemo(() => {
    return asPath.startsWith('/super-admin');
  }, [asPath]);
  const navAdmin = useNavAdmin();

  // Check profile path for sidebar
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
  ]);

  if (isLoading || clientConfig.isLoading || status !== 'authenticated') {
    return <Loading />;
  }

  // Check if user don't have a workspace
  if (workspaces.length === 0 && !isSuperAdmin && status === 'authenticated') {
    return <NoAccess signOut={handleSignOutClick} />;
  }

  return (
    <div className="flex min-h-screen flex-col space-y-6">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <MainNav
            logo={clientConfig.app.logo}
            name={clientConfig.app.name}
            items={navItems}
            sidebarItems={sidebarItems}
          />

          <div className="flex space-x-1">
            <LanguageSelector />
            <ThemeToggle />
            <UserAccountNav
              user={{
                name: user?.name ?? null,
                image: user?.profileImage ?? null,
                email: user?.email ?? null,
                role: selectedWorkspace?.role
                  ? getUserRoleName(t, selectedWorkspace.role as UserRoleEnum)
                  : 'User',
              }}
              onSignOutClick={handleSignOutClick}
            />
          </div>
        </div>
      </header>
      <div
        className={cn(
          'container flex-1',
          sidebarItems.length > 0 ? 'grid gap-12 md:grid-cols-[200px_1fr]' : ''
        )}
      >
        <aside className="sticky top-20 hidden w-[200px] flex-col self-start md:flex">
          <SidebarNav
            items={sidebarItems}
            workspaces={
              isAdminPath || isProfilePath
                ? null
                : {
                    workspaces,
                    selectedWorkspace,
                    onSelectWorkspace: async (value): Promise<void> => {
                      // update selected workspace in session
                      await update({
                        user: {
                          ...session?.user,
                          selectedWorkspace: {
                            id: value,
                            name: workspaces.find((w) => w.id === value)?.name,
                            role: workspaces.find((w) => w.id === value)?.role,
                          },
                        },
                      });
                    },
                    isLoading: false,
                  }
            }
          />
        </aside>
        <main className="flex w-full flex-1 flex-col overflow-hidden pb-10">
          <FeatureFlagsProvider
            userFeatureFlags={
              user?.featureFlags?.map((uf) => {
                return {
                  featureFlagId: uf.featureFlagId,
                  released: uf.released,
                };
              }) ?? []
            }
            workspaceId={selectedWorkspace?.id ?? ''}
          >
            {children}
          </FeatureFlagsProvider>
        </main>
      </div>
    </div>
  );
};
