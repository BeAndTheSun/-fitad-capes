'use client';

import {
  Button,
  cn,
  DropdownMenu,
  DropdownMenuTrigger,
} from '@meltstudio/theme';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CaretSortIcon,
  MixerHorizontalIcon,
} from '@radix-ui/react-icons';
import type { Column } from '@tanstack/react-table';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { useInstantSearchContext, useSortBy } from 'react-instantsearch';

import { FiltersDropdownMenu } from './dropdown-filter-options';
import { SortingDropdownMenu } from './sorting-options';

type AlgoliaTableColumnHeaderProps<TData, TValue> = {
  column: Column<TData, TValue>;
  title: ReactNode;
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>;

export const AlgoliaTableColumnHeader = <TData, TValue>(
  props: AlgoliaTableColumnHeaderProps<TData, TValue>
): React.ReactNode => {
  const { column, title, className } = props;
  const { indexName } = useInstantSearchContext();

  const baseIndexName = indexName.replace(/_\w+_(asc|desc)$/, '');
  const ascIndex = `${baseIndexName}_${column.id}_asc`;
  const descIndex = `${baseIndexName}_${column.id}_desc`;

  const { canRefine, refine, currentRefinement } = useSortBy({
    items: [
      { label: 'asc', value: ascIndex },
      { label: 'desc', value: descIndex },
    ],
  });

  const isSorted = useMemo(() => {
    if (currentRefinement === ascIndex) {
      return 'asc';
    }
    if (currentRefinement === descIndex) {
      return 'desc';
    }
    return false;
  }, [ascIndex, currentRefinement, descIndex]);

  const canSort = column.getCanSort();
  const canFilter = column.getCanFilter();

  if (!canSort && !canFilter) {
    return <div className={cn(className)}>{title}</div>;
  }

  const handleAscClick = (): void => {
    if (!canRefine) return;

    if (currentRefinement === ascIndex) {
      refine(indexName);
      return;
    }

    refine(ascIndex);
  };

  const handleDescClick = (): void => {
    if (!canRefine) return;

    if (currentRefinement === descIndex) {
      refine(indexName);
      return;
    }

    refine(descIndex);
  };

  return (
    <div className={cn('flex items-center space-x-1', className)}>
      <span>{title}</span>

      <div className="flex">
        {canSort && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-6 p-0 data-[state=open]:bg-accent"
              >
                {isSorted === 'desc' && <ArrowDownIcon className="size-4" />}
                {isSorted === 'asc' && <ArrowUpIcon className="size-4" />}
                {isSorted === false && <CaretSortIcon className="size-4" />}
              </Button>
            </DropdownMenuTrigger>

            <SortingDropdownMenu
              state={isSorted}
              onSortAsc={handleAscClick}
              onSortDesc={handleDescClick}
            />
          </DropdownMenu>
        )}

        {canFilter && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-6 p-0 data-[state=open]:bg-accent"
              >
                <MixerHorizontalIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>

            <FiltersDropdownMenu
              attribute={column.id}
              withSearch
              key={column.id}
            />
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};
