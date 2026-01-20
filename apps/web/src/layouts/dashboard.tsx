import { FeatureFlagsProvider } from '@meltstudio/feature-flags';
import { cn } from '@meltstudio/theme';
import {
  LanguageSelector,
  MainNav,
  SidebarNav,
  UserAccountNav,
} from '@meltstudio/ui';

import { Loading } from '@/components/common/loading';
import { NoAccess } from '@/components/no-access';
import { ThemeToggle } from '@/components/theme-toggle';
import { ViewAsSelector } from '@/components/view-as-member/view-as-selector';
import { useClientConfig } from '@/config/client';
import { useDashboardLayout } from '@/hooks/use-dashboard-layout';

export const DashboardLayout: React.FC<React.PropsWithChildren> = (props) => {
  const { children } = props;
  const clientConfig = useClientConfig();
  const {
    user,
    selectedWorkspace,
    workspaces,
    isLoading,
    isSuperAdmin,
    navItems,
    sidebarItems,
    handleSignOutClick,
    userAccountLabel,
    showSidebar,
    workspaceSelectorProps,
    status,
  } = useDashboardLayout();

  if (isLoading) {
    return <Loading />;
  }

  // Check if user don't have a workspace
  const isVenueOwner = user?.isVenueOwner ?? false;
  if (
    workspaces.length === 0 &&
    !isSuperAdmin &&
    !isVenueOwner &&
    status === 'authenticated'
  ) {
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

          <div className="flex items-center space-x-2">
            {isSuperAdmin && <ViewAsSelector />}
            <LanguageSelector />
            <ThemeToggle />
            <UserAccountNav
              user={{
                name: user?.name ?? null,
                image: user?.profileImage ?? null,
                email: user?.email ?? null,
                role: userAccountLabel,
              }}
              onSignOutClick={handleSignOutClick}
            />
          </div>
        </div>
      </header>
      <div
        className={cn(
          'container flex-1',
          showSidebar ? 'grid gap-12 md:grid-cols-[200px_1fr]' : ''
        )}
      >
        <aside className="sticky top-20 hidden w-[200px] flex-col self-start md:flex">
          <SidebarNav
            items={sidebarItems}
            workspaces={workspaceSelectorProps}
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
