import { getBaseUrl } from '@meltstudio/core';
import { CookieIcon, PersonIcon } from '@radix-ui/react-icons';
import { useTranslation } from 'next-i18next';

import { FeatureFlag, useFeatureFlag } from '@/feature-flags/index';
import { useSidebarItems } from '@/hooks/use-sidebar-items';
import type { MainNavItem } from '@/ui/main-nav';
import type { SidebarNavItem } from '@/ui/sidebar-nav';

import { env } from './env';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
export const useClientConfig = () => {
  const { t } = useTranslation();

  const reportsFlag = useFeatureFlag(FeatureFlag.REPORTS_MODULE);
  const historyFlag = useFeatureFlag(FeatureFlag.HISTORY_MODULE);
  const chatsFlag = useFeatureFlag(FeatureFlag.CHATS_MODULE);
  const membersFlag = useFeatureFlag(FeatureFlag.MEMBERS_MANAGEMENT);
  const webhooksFlag = useFeatureFlag(FeatureFlag.WEBHOOKS_MODULE);
  const integrationsFlag = useFeatureFlag(FeatureFlag.INTEGRATIONS_MODULE);

  const isLoading =
    reportsFlag.isLoading ||
    historyFlag.isLoading ||
    chatsFlag.isLoading ||
    membersFlag.isLoading ||
    webhooksFlag.isLoading ||
    integrationsFlag.isLoading;

  // Use the new hook to get sidebar items based on role
  const roleBasedSidebarItems = useSidebarItems();

  const buildProfileSidebarItems = (): SidebarNavItem[] => {
    const items: SidebarNavItem[] = [];

    items.push({
      title: t('Profile'),
      href: '/profile',
      icon: PersonIcon,
    });

    return items;
  };

  return {
    isLoading,
    node: {
      env: env.NEXT_PUBLIC_NODE_ENV,
    },
    api: {
      url: `${getBaseUrl()}/api`,
    },
    app: {
      logo: CookieIcon,
      name: 'Melt',
    },
    nav: {
      items: [
        {
          title: t('Dashboard'),
          href: '/',
        },
      ] satisfies MainNavItem[],
      sidebarItems: isLoading ? [] : roleBasedSidebarItems,
      profileSidebarItems: buildProfileSidebarItems(),
    },
    twoFactorAuth: {
      provider: env.NEXT_PUBLIC_TWO_FACTOR_AUTH_PROVIDER,
    },
  };
};
