'use client';

import { useSearchParams } from '@meltstudio/core';
import { Button } from '@meltstudio/theme';
import { Cross2Icon } from '@radix-ui/react-icons';
import type { Table } from '@tanstack/react-table';
import { useRouter } from 'next/router';
import { Trans } from 'next-i18next';
import type { MouseEventHandler } from 'react';

import { DataTableDateRangeFilter } from './filters/date-range';
import { DataTableSearchFilter } from './filters/search';
import { DataTableSelectFilter } from './filters/select';
import type { DataTableFilter, DataTableGlobalFilter } from './types';
import { DataTableViewOptions } from './view-options';

type DataTableToolbarProps<TData> = {
  table: Table<TData>;
  globalFiltersDefs?: DataTableGlobalFilter[];
  columnFiltersDefs?: DataTableFilter[];
  actionButton?: React.ReactNode;
};

export const DataTableToolbar = <TData,>(
  props: DataTableToolbarProps<TData>
): React.ReactNode => {
  const {
    table,
    globalFiltersDefs = [],
    columnFiltersDefs = [],
    actionButton,
  } = props;

  // TODO: find a way to use hooks both from next/navigation and next/router
  const router = useRouter();
  const { pathname } = router;
  const searchParams = useSearchParams();

  const hasFilters =
    globalFiltersDefs.length > 0 || columnFiltersDefs.length > 0;
  // TODO: this will probably need improvements if the page has search params
  // not related to the table
  const isFiltered = searchParams != null && searchParams.toString() !== '';

  const handleResetClick: MouseEventHandler<HTMLButtonElement> = async () => {
    if (pathname == null) {
      return;
    }

    await router.push(pathname);
  };

  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex flex-col justify-start space-y-2 md:flex-row md:items-center md:space-x-2 md:space-y-0">
        {hasFilters && (
          <>
            {globalFiltersDefs.map((filter) => {
              if (filter.type === 'search') {
                return (
                  <DataTableSearchFilter
                    key={filter.id}
                    table={table}
                    id={filter.id}
                    placeholder={filter.placeholder}
                  />
                );
              }

              if (filter.type === 'select') {
                return (
                  <DataTableSelectFilter
                    key={filter.id}
                    table={table}
                    isGlobal
                    id={filter.id}
                    title={filter.title}
                    allowMultiple={filter.allowMultiple}
                    options={filter.options}
                  />
                );
              }

              if (filter.type === 'date-range') {
                return (
                  <DataTableDateRangeFilter
                    key={filter.id}
                    table={table}
                    id={filter.id}
                    disabledDays={filter.disabledDays}
                  />
                );
              }

              // @ts-expect-error it's best to leave this here to know when a bad
              // filter is passed
              throw new Error(`Unknown global filter type: ${filter.type}`);
            })}

            {columnFiltersDefs.map((filter) => {
              if (filter.type === 'select') {
                return (
                  <DataTableSelectFilter
                    key={filter.id}
                    table={table}
                    isGlobal={false}
                    id={filter.id}
                    title={filter.title}
                    allowMultiple={filter.allowMultiple}
                    options={filter.options}
                  />
                );
              }

              // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
              throw new Error(`Unknown filter type: ${filter.type}`);
            })}

            {isFiltered && (
              <Button
                variant="ghost"
                onClick={handleResetClick}
                className="h-8 px-2 lg:px-3"
              >
                <Trans>Reset</Trans>
                <Cross2Icon className="ml-2 size-4" />
              </Button>
            )}
          </>
        )}
      </div>

      <div className="flex items-end space-x-2">
        <DataTableViewOptions table={table} />
        {actionButton && <div className="flex justify-end">{actionButton}</div>}
      </div>
    </div>
  );
};
