import type { TabNavigationItem } from '@meltstudio/ui';
import { RouterTabs } from '@meltstudio/ui';
import { useTranslation } from 'next-i18next';
import type { FC } from 'react';

export const AsyncTasksLayout: FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ children, className }) => {
  const { t } = useTranslation();

  const nav: TabNavigationItem[] = [
    {
      name: t('Tasks'),
      href: '/super-admin/async-tasks',
    },
    {
      name: t('Export Database'),
      href: '/super-admin/async-tasks/export-db',
    },
  ];

  return (
    <RouterTabs navigation={nav} className={className}>
      {children}
    </RouterTabs>
  );
};
