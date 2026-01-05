import { cn, Tabs, TabsContent, TabsList } from '@meltstudio/theme';
import { TabsTrigger } from '@radix-ui/react-tabs';
import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';

import { useSafePush } from './safe-push';

export type TabNavigationItem = {
  name: string;
  href: string;
  children?: string[];
};

type RouterTabsProps = {
  navigation: TabNavigationItem[];
  className?: string;
  defaultTab?: string;
  children: React.ReactNode;
};

const RouterTabs: React.FC<RouterTabsProps> = ({
  children,
  navigation,
  defaultTab,
  className,
}) => {
  const router = useRouter();
  const { safePush } = useSafePush();

  const isCurrentTab = useCallback(
    (navItem: TabNavigationItem): boolean => {
      if (navItem.href === router.pathname) return true;

      if (navItem.children) return navItem.children.includes(router.pathname);
      return false;
    },
    [router.pathname]
  );

  const activeTab = useMemo(() => {
    const active = navigation.find((tab) => isCurrentTab(tab));
    return active?.href;
  }, [navigation, isCurrentTab]);

  const handleTabChange = (newValue: string): void => {
    const url = newValue;
    safePush(url);
  };

  return (
    <Tabs
      value={activeTab}
      defaultValue={defaultTab}
      onValueChange={handleTabChange}
      className={cn('flex flex-col', className)}
    >
      <TabsList>
        {navigation.map((tab) => (
          <TabsTrigger
            key={tab.href}
            className="flex h-[45px] flex-1 select-none items-center justify-center px-5 text-[15px] leading-none outline-none first:rounded-tl-md last:rounded-tr-md hover:text-gray-700 data-[state=active]:text-gray-700 data-[state=active]:shadow-[inset_0_-1px_0_0,0_1px_0_0] data-[state=active]:shadow-current data-[state=active]:focus:relative data-[state=active]:focus:shadow-[0_0_0_2px] data-[state=active]:focus:shadow-black"
            value={tab.href}
          >
            {tab.name}
          </TabsTrigger>
        ))}
      </TabsList>
      {navigation.map((tab) => (
        <TabsContent
          key={tab.href}
          className="px-6 pb-12 pt-6"
          value={tab.href}
        >
          {children}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export { RouterTabs };
