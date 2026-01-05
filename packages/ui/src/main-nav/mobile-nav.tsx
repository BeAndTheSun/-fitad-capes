'use client';

import { cn } from '@meltstudio/theme';
import Link from 'next/link';

import { useLockBody } from '@/ui/hooks/use-lock-body';
import type { SidebarNavItem } from '@/ui/sidebar-nav';

import type { MainNavItem } from '.';
import { NavItem } from './nav-item';

type MobileNavProps = {
  name: string;
  items: MainNavItem[];
  current: string | undefined;
  sidebarItems?: SidebarNavItem[];
  onItemSelect?: () => void;
};

export const MobileNav: React.FC<React.PropsWithChildren<MobileNavProps>> = (
  props
) => {
  const { name, items, current, children, sidebarItems, onItemSelect } = props;

  useLockBody();

  return (
    <div
      className={cn(
        'fixed inset-0 top-16 z-50 grid h-[calc(100vh-4rem)] grid-flow-row auto-rows-max overflow-auto p-6 pb-32 shadow-md animate-in slide-in-from-left-80 md:hidden'
      )}
    >
      <div className="relative z-20 grid gap-6 rounded-md bg-popover p-4 text-popover-foreground shadow-md">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold">{name}</span>
        </Link>
        <nav className="grid grid-flow-row auto-rows-max text-sm">
          {items.map((item) => (
            <NavItem
              key={item.title}
              className="flex w-full items-center rounded-md p-2 text-sm font-medium hover:underline"
              selected={current === item.href}
              {...item}
            />
          ))}
        </nav>
        {sidebarItems && sidebarItems.length > 0 && (
          <>
            <div className="my-4 border-t border-border" />
            <nav className="grid grid-flow-row auto-rows-max text-sm">
              {sidebarItems.map((item) => (
                <NavItem
                  key={item.id}
                  className="flex w-full items-center rounded-md p-2 text-sm font-medium hover:underline"
                  selected={current === item.href}
                  title={item.title as string}
                  href={item.href ?? ''}
                  onClick={onItemSelect}
                />
              ))}
            </nav>
          </>
        )}
        {children}
      </div>
    </div>
  );
};
