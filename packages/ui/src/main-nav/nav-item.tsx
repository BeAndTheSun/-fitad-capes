'use client';

import { cn } from '@meltstudio/theme';
import Link from 'next/link';

export type NavItemProps = {
  className?: string;
  title: string;
  href: string;
  selected: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

export const NavItem: React.FC<NavItemProps> = (props) => {
  const { className, disabled, href, title, selected, onClick } = props;

  if (disabled) {
    return (
      <span className={cn(className, 'cursor-not-allowed opacity-60')}>
        {title}
      </span>
    );
  }

  return (
    <Link
      className={cn(
        className,
        selected ? 'text-foreground' : 'text-foreground/60'
      )}
      href={href}
    >
      <button type="button" onClick={onClick}>
        {title}
      </button>
    </Link>
  );
};
