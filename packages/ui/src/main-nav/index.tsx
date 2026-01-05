'use client';

import { Cross2Icon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Trans } from 'next-i18next';
import { useState } from 'react';

import type { SidebarNavItem } from '@/ui/sidebar-nav';

import { MobileNav } from './mobile-nav';
import type { NavItemProps } from './nav-item';
import { NavItem } from './nav-item';

export type MainNavItem = Omit<NavItemProps, 'className' | 'selected'>;

type MainNavProps = {
  logo?: React.FC;
  name: string;
  items?: MainNavItem[];
  sidebarItems?: SidebarNavItem[];
};

export const MainNav: React.FC<React.PropsWithChildren<MainNavProps>> = (
  props
) => {
  const { logo: Logo, name, items = [], children, sidebarItems } = props;

  // TODO: find a way to use hooks both from next/navigation and next/router
  const { pathname } = useRouter();
  const hrefs = items.map((item) => item.href);
  hrefs.sort((a, b) => b.length - a.length);
  const current = hrefs.find((href) => pathname.startsWith(href));

  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);

  return (
    <div className="flex gap-6 md:gap-10">
      <Link href="/" className="hidden items-center space-x-2 md:flex">
        {Logo != null && <Logo />}
        <span className="hidden font-bold sm:inline-block">{name}</span>
      </Link>
      {items.length > 0 ? (
        <nav className="hidden gap-6 md:flex">
          {items.map((item) => (
            <NavItem
              className="flex items-center text-lg font-medium transition-colors hover:text-foreground/80 sm:text-sm"
              key={item.title}
              selected={current === item.href}
              {...item}
            />
          ))}
        </nav>
      ) : null}
      <button
        type="button"
        className="flex items-center space-x-2 md:hidden"
        onClick={(): void => setShowMobileMenu(!showMobileMenu)}
      >
        {showMobileMenu && <Cross2Icon />}
        <span className="font-bold">
          <Trans>Menu</Trans>
        </span>
      </button>
      {showMobileMenu && items && (
        <MobileNav
          name={name}
          items={items}
          current={current}
          sidebarItems={sidebarItems}
          onItemSelect={(): void => setShowMobileMenu(false)}
        >
          {children}
        </MobileNav>
      )}
    </div>
  );
};
