'use client';

import {
  Button,
  Table,
  TableHead,
  TableHeader,
  TableRow,
} from '@meltstudio/theme';
import type { ColumnDef, PaginationState } from '@tanstack/react-table';
import { flexRender } from '@tanstack/react-table';
import { Link } from 'lucide-react';

import { DataTablePagination } from './pagination';
import { DataTableBody } from './table-body';
import { DataTableToolbar } from './toolbar';
import type {
  DataTableFilter,
  DataTableGlobalFilter,
  DataTableSorting,
} from './types';
import type { FilterValue, GlobalFilter } from './use-data-table';
import { useDataTable } from './use-data-table';

type DataTablePaginationProps =
  | {
      pagination: PaginationState;
      pageSizeOptions?: number[];
      pageCount: number;
    }
  | { pagination?: never; pageSizeOptions?: never; pageCount?: never };

type DataTableGlobalFilteringProps =
  | {
      globalFiltersDefs: DataTableGlobalFilter[];
      globalFilter: GlobalFilter;
    }
  | { globalFiltersDefs?: never; globalFilter?: never };

type DataTableColumnFilteringProps<TData> =
  | {
      columnFiltersDefs: DataTableFilter[];
      columnFilters: Partial<Record<keyof TData, FilterValue>>;
    }
  | { columnFiltersDefs?: never; columnFilters?: never };

type DataTableProps<TData> = {
  // any needs to be used here to avoid a typing issue from tanstack/table
  // https://github.com/TanStack/table/issues/4382#issuecomment-1420412062
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<TData, any>[];
  data?: TData[];
  error?: string | null;
  loading?: boolean | null;

  // sorting
  sorting?: DataTableSorting<TData>[];
  actionButtonText?: string;
  actionButtonHref?: string;
  actionButton?: React.ReactNode;
} & DataTablePaginationProps &
  DataTableGlobalFilteringProps &
  DataTableColumnFilteringProps<TData>;

export const DataTable = <TData,>(
  props: DataTableProps<TData>
): React.ReactNode => {
  const {
    columns,
    data = [],
    error,
    loading,
    pagination,
    pageSizeOptions,
    pageCount,
    sorting,
    globalFiltersDefs,
    globalFilter,
    columnFiltersDefs,
    columnFilters,
    actionButtonText,
    actionButtonHref,
    actionButton,
  } = props;

  const table = useDataTable({
    columns,
    data,
    pagination,
    pageCount,
    sorting,
    globalFiltersDefs,
    globalFilter,
    columnFiltersDefs,
    columnFilters,
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

  const actionButtonElement = renderActionButton();

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        globalFiltersDefs={globalFiltersDefs}
        columnFiltersDefs={columnFiltersDefs}
        actionButton={actionButtonElement}
      />

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

      {pagination != null && (
        <DataTablePagination table={table} pageSizeOptions={pageSizeOptions} />
      )}
    </div>
  );
};
