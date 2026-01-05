'use client';

import { Avatar, AvatarFallback, AvatarImage, cn } from '@meltstudio/theme';
import type { AvatarProps } from '@radix-ui/react-avatar';
import { PersonIcon } from '@radix-ui/react-icons';

type UserAvatarProps = {
  user: { name: string | null; image: string | null };
  fallbackIconClassName?: string;
} & AvatarProps;

export const UserAvatar: React.FC<UserAvatarProps> = (props) => {
  const { fallbackIconClassName, ...extra } = props;
  const { user } = extra;

  return (
    <Avatar {...extra}>
      <AvatarImage alt="Picture" src={user.image ?? undefined} />
      <AvatarFallback>
        <span className="sr-only">{user.name}</span>
        <PersonIcon className={cn('h-4 w-4', fallbackIconClassName)} />
      </AvatarFallback>
    </Avatar>
  );
};
