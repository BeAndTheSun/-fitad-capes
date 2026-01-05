import { cn, DropdownMenuContent, DropdownMenuItem } from '@meltstudio/theme';
import { ArrowDownIcon, ArrowUpIcon } from '@radix-ui/react-icons';
import type { FC } from 'react';

type SortingMenuProps = {
  state: 'asc' | 'desc' | false;
  onSortAsc: () => void;
  onSortDesc: () => void;
};

export const SortingDropdownMenu: FC<SortingMenuProps> = ({
  state,
  onSortAsc,
  onSortDesc,
}) => {
  return (
    <DropdownMenuContent align="start">
      <DropdownMenuItem
        onClick={onSortAsc}
        className={cn(state === 'asc' && 'bg-muted/50')}
      >
        <ArrowUpIcon className="mr-2 size-3.5 text-muted-foreground/70" />
        Asc
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={onSortDesc}
        className={cn(state === 'desc' && 'bg-muted/50')}
      >
        <ArrowDownIcon className="mr-2 size-3.5 text-muted-foreground/70" />
        Desc
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
};
