import '@meltstudio/theme/globals.css';

import { createQueryClient } from '@meltstudio/client-common';
import { QueryClientProvider } from '@tanstack/react-query';
import { Inter as FontSans } from 'next/font/google';
import { useRouter } from 'next/router';
import { SessionProvider } from 'next-auth/react';
import { appWithTranslation } from 'next-i18next';
import { ThemeProvider } from 'next-themes';
import React, { useEffect } from 'react';

import { GoogleTagManagerComponent } from '@/components/google-tag-manager';
import { UserProvider, useSessionUser } from '@/components/user/user-context';
import { ViewAsMemberProvider } from '@/components/view-as-member/view-as-member-context';
import { FeatureFlagsProvider } from '@/feature-flags/index';
import { DashboardLayout } from '@/layouts/dashboard';
import nextI18NextConfig from '@/next-i18next.config';
import { Toaster } from '@/theme/index';
import type { AppPropsWithLayout } from '@/types/next';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const queryClient = createQueryClient();

const AppWithFeatureFlags = (props: AppPropsWithLayout): JSX.Element => {
  const { user, selectedWorkspace } = useSessionUser();

  const {
    Component,
    pageProps: { session: _session, ...pageProps },
  } = props;
  const Layout = Component.Layout ?? DashboardLayout;

  return (
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
      <Layout>
        <GoogleTagManagerComponent />
        <Component {...pageProps} />
      </Layout>
    </FeatureFlagsProvider>
  );
};

const App = (props: AppPropsWithLayout): JSX.Element => {
  const router = useRouter();

  useEffect(() => {
    const storedLocale = localStorage.getItem('locale');
    if (storedLocale && storedLocale !== router.locale) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      router.push(router.asPath, router.asPath, { locale: storedLocale });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <style jsx global>{`
        :root {
          --font-sans: ${fontSans.style.fontFamily};
        }
      `}</style>

      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <ViewAsMemberProvider>
            <AppWithFeatureFlags {...props} />
          </ViewAsMemberProvider>
        </UserProvider>
        <Toaster />
      </QueryClientProvider>
    </>
  );
};

const AppWithI18n = appWithTranslation(App, nextI18NextConfig);

const AppWithAuth = (props: AppPropsWithLayout): JSX.Element => {
  const {
    pageProps: { session },
  } = props;
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider session={session}>
        <AppWithI18n {...props} />
      </SessionProvider>
    </ThemeProvider>
  );
};

export default AppWithAuth;
