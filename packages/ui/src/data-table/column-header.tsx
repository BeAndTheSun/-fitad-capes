'use client';

import {
  Button,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@meltstudio/theme';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CaretSortIcon,
} from '@radix-ui/react-icons';

import type { DataTableColumnHeaderProps } from './types';

export const DataTableColumnHeader = <TData, TValue>(
  props: DataTableColumnHeaderProps<TData, TValue>
): React.ReactNode => {
  const { column, title, className } = props;

  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  const isSorted = column.getIsSorted();

  const handleAscClick = (): void => {
    if (isSorted !== 'asc') {
      column.toggleSorting(false);
    } else {
      column.clearSorting();
    }
  };
  const handleDescClick = (): void => {
    if (isSorted !== 'desc') {
      column.toggleSorting(true);
    } else {
      column.clearSorting();
    }
  };

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
          >
            <span>{title}</span>
            {isSorted === 'desc' && <ArrowDownIcon className="ml-2 size-4" />}
            {isSorted === 'asc' && <ArrowUpIcon className="ml-2 size-4" />}
            {isSorted === false && <CaretSortIcon className="ml-2 size-4" />}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start">
          <DropdownMenuItem
            onClick={handleAscClick}
            className={cn(isSorted === 'asc' && 'bg-muted/50')}
          >
            <ArrowUpIcon className="mr-2 size-3.5 text-muted-foreground/70" />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleDescClick}
            className={cn(isSorted === 'desc' && 'bg-muted/50')}
          >
            <ArrowDownIcon className="mr-2 size-3.5 text-muted-foreground/70" />
            Desc
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
