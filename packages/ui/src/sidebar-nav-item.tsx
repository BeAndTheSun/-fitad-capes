import { Button, cn } from '@meltstudio/theme';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import Link from 'next/link';

import type { SidebarNavItem } from './sidebar-nav';

type SidebarNavItemComponentProps = {
  item: SidebarNavItem;
  level?: number;
  current?: string;
  isExpanded: (itemId: string) => boolean;
  toggleExpanded: (itemId: string) => void;
};

export const SidebarNavItemComponent: React.FC<
  SidebarNavItemComponentProps
> = ({ item, level = 0, current, isExpanded, toggleExpanded }) => {
  const Icon = item.icon ?? ChevronDownIcon;
  const hasChildren = item.children && item.children.length > 0;
  const itemId = item.id || item.title?.toString() || '';
  const expanded = isExpanded(itemId);

  const paddingLeft = `${12 + level * 16}px`;

  if (hasChildren) {
    return (
      <div key={itemId}>
        <Button
          onClick={() => toggleExpanded(itemId)}
          variant="ghost"
          className={cn(
            'group flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-accent-foreground font-medium hover:bg-accent hover:text-accent-foreground',
            'bg-transparent',
            item.disabled && 'cursor-not-allowed opacity-80'
          )}
          style={{ paddingLeft }}
          disabled={item.disabled}
        >
          <div className="flex items-center">
            <Icon className="mr-2 size-4" />
            <span>{item.title}</span>
          </div>
          <ChevronDownIcon
            className={cn(
              'size-4 transition-transform duration-200',
              expanded ? 'rotate-180' : 'rotate-0'
            )}
          />
        </Button>

        {expanded && (
          <div className="mt-1 space-y-1">
            {item.children?.map((child) => (
              <SidebarNavItemComponent
                key={child.id || child.title?.toString()}
                item={child}
                level={level + 1}
                current={current}
                isExpanded={isExpanded}
                toggleExpanded={toggleExpanded}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (!item.href) return null;

  return (
    <Link key={itemId} href={item.disabled ? '/' : item.href}>
      <span
        className={cn(
          'group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
          current === item.href ? 'bg-accent' : 'transparent',
          item.disabled && 'cursor-not-allowed opacity-80'
        )}
        style={{ paddingLeft }}
      >
        <Icon className="mr-2 size-4" />
        <span>{item.title}</span>
      </span>
    </Link>
  );
};
