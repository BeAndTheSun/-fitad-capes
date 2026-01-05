import { getBaseUrl } from '@meltstudio/core';
import {
  ChatBubbleIcon,
  ClockIcon,
  Component1Icon,
  CookieIcon,
  FileTextIcon,
  LaptopIcon,
  Link1Icon,
  PersonIcon,
  StackIcon,
} from '@radix-ui/react-icons';
import { useTranslation } from 'next-i18next';

import { FeatureFlag, useFeatureFlag } from '@/feature-flags/index';
import type { MainNavItem } from '@/ui/main-nav';
import type { SidebarNavItem } from '@/ui/sidebar-nav';

import { env } from './env';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
export const useClientConfig = (isAdmin?: boolean) => {
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

  const buildSidebarItems = (): SidebarNavItem[] => {
    const items: SidebarNavItem[] = [
      {
        title: t('Dashboard'),
        href: '/',
        icon: LaptopIcon,
      },
    ];

    if (reportsFlag.released) {
      items.push({
        title: t('Reports'),
        href: '/reports',
        icon: FileTextIcon,
      });
    }

    if (historyFlag.released) {
      items.push({
        title: t('History'),
        href: '/history',
        icon: ClockIcon,
      });
    }

    if (chatsFlag.released) {
      items.push({
        title: t('Assistant'),
        href: '/chat-assistant',
        icon: ChatBubbleIcon,
      });
    }

    if (isAdmin) {
      const adminChildren: SidebarNavItem[] = [];

      if (membersFlag.released) {
        adminChildren.push({
          title: t('Members'),
          href: '/members',
          icon: PersonIcon,
        });
      }

      adminChildren.push({
        title: t('Feature Flags'),
        href: '/feature-flags',
        icon: StackIcon,
      });

      if (webhooksFlag.released) {
        adminChildren.push({
          title: t('Webhooks'),
          href: '/webhooks',
          icon: Link1Icon,
        });
      }

      if (integrationsFlag.released) {
        adminChildren.push({
          title: t('Integrations'),
          href: '/integrations',
          icon: Link1Icon,
        });
      }

      if (adminChildren.length > 0) {
        items.push({
          title: t('Admin'),
          icon: Component1Icon,
          isCollapsible: true,
          children: adminChildren,
        });
      }
    }

    return items;
  };

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
      sidebarItems: isLoading ? [] : buildSidebarItems(),
      profileSidebarItems: buildProfileSidebarItems(),
    },
    twoFactorAuth: {
      provider: env.NEXT_PUBLIC_TWO_FACTOR_AUTH_PROVIDER,
    },
  };
};
