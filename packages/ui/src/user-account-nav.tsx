'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@meltstudio/theme';
import Link from 'next/link';
import { Trans } from 'next-i18next';

import { UserAvatar } from './user-avatar';

export type UserAccountNavItem = {
  title: string;
  href: string;
};

type UserAccountNavProps = {
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
    role: string;
  };
  onSignOutClick?: () => void | Promise<void>;
  items?: UserAccountNavItem[];
} & React.HTMLAttributes<HTMLDivElement>;

export const UserAccountNav: React.FC<UserAccountNavProps> = (props) => {
  const { user, items = [], onSignOutClick } = props;

  const handleSignOutClick = async (event: Event): Promise<void> => {
    event.preventDefault();
    if (onSignOutClick != null) {
      await onSignOutClick();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <UserAvatar
          user={{ name: user.name, image: user.image }}
          className="size-8"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {user.name && (
              <p className="font-medium">
                {user.name} ( {user.role} )
              </p>
            )}
            {user.email && (
              <p className="w-[200px] truncate text-sm text-muted-foreground">
                {user.email}
              </p>
            )}
          </div>
        </div>
        {items.length > 0 && <DropdownMenuSeparator />}
        {items.map((item) => (
          <DropdownMenuItem key={item.title} asChild>
            <Link href={item.href}>{item.title}</Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <Link href="/profile">
          <DropdownMenuItem className="cursor-pointer">
            <Trans>Settings</Trans>
          </DropdownMenuItem>
        </Link>
        {onSignOutClick != null && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={handleSignOutClick}
            >
              <Trans>Sign out</Trans>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
