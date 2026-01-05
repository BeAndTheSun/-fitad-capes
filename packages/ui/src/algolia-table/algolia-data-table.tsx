'use client';

import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableHead,
  TableHeader,
  TableRow,
} from '@meltstudio/theme';
import type { ColumnDef } from '@tanstack/react-table';
import { flexRender } from '@tanstack/react-table';
import Link from 'next/link';
import { useHits } from 'react-instantsearch';

import { DataTableBody } from '@/ui/data-table/table-body';
import { useDataTable } from '@/ui/data-table/use-data-table';
import { DataTableViewOptions } from '@/ui/data-table/view-options';

import { SearchBox } from './search-box';

export type DataTableProps<TData> = {
  // any needs to be used here to avoid a typing issue from tanstack/table
  // https://github.com/TanStack/table/issues/4382#issuecomment-1420412062
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<TData, any>[];
  error?: string | null;
  loading?: boolean | null;
  withSearch?: boolean;
  searchPlaceholder?: string;
  actionButtonText?: string;
  actionButtonHref?: string;
  actionButton?: React.ReactNode;
  hasViewOptions?: boolean;
  tableFilters?: Array<{
    key: string;
    label: string;
    options: Array<{ value: string; label: string }>;
    defaultValue?: string;
  }>;
  activeFilters?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
};

export const AlgoliaDataTable = <TData extends Record<string, unknown>>(
  props: DataTableProps<TData>
): React.ReactNode => {
  const { items } = useHits<TData>();

  const {
    columns,
    error,
    loading,
    withSearch,
    searchPlaceholder,
    actionButtonText,
    actionButtonHref,
    actionButton,
    hasViewOptions,
    tableFilters,
    activeFilters = {},
    onFilterChange,
  } = props;

  const table = useDataTable({
    columns,
    data: items || [],
  });

  const renderActionButton = (): JSX.Element | null => {
    if (actionButton) {
      return <div>{actionButton}</div>;
    }

    if (actionButtonText && actionButtonHref) {
      return (
        <Button>
          <Link href={actionButtonHref}>{actionButtonText}</Link>
        </Button>
      );
    }
    return null;
  };

  const hasActionButton =
    actionButton || (actionButtonText && actionButtonHref);

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        {withSearch && (
          <div className="flex-1">
            <SearchBox placeholder={searchPlaceholder} />
          </div>
        )}

        <div className="flex items-center space-x-2">
          {Array.isArray(tableFilters) &&
            tableFilters.length > 0 &&
            tableFilters.map((filter) => (
              <Select
                key={filter.key}
                value={activeFilters[filter.key] || ''}
                onValueChange={(value) => onFilterChange?.(filter.key, value)}
              >
                <SelectTrigger className="h-2/4 w-[170px]">
                  <SelectValue placeholder={filter.label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{filter.label}</SelectItem>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}

          {hasViewOptions && <DataTableViewOptions table={table} />}
          {hasActionButton && renderActionButton()}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <DataTableBody table={table} error={error} loading={loading} />
        </Table>
      </div>
    </>
  );
};
