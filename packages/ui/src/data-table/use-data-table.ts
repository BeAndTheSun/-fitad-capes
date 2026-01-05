import {
  parseSearchParams,
  stringifySearchParams,
  useSearchParams,
} from '@meltstudio/core';
import type {
  ColumnDef,
  ColumnFiltersState,
  OnChangeFn,
  PaginationState,
  SortingState,
  Table,
  TableState,
} from '@tanstack/react-table';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import type { ReadonlyURLSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import { z } from 'zod';

import type {
  DataTableFilter,
  DataTableGlobalFilter,
  DataTableSorting,
} from './types';

const nativeValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.date(),
  z.undefined(),
]);
const filterValueSchema = z.union([
  nativeValueSchema,
  z.array(nativeValueSchema),
  z.record(nativeValueSchema),
]);

export type FilterValue = z.infer<typeof filterValueSchema>;

export const globalFilterSchema = z.record(filterValueSchema).catch({});

export type GlobalFilter = z.infer<typeof globalFilterSchema>;

function stringifyTableState(
  state: Partial<TableState>,
  searchParams: URLSearchParams | ReadonlyURLSearchParams | null,
  globalFiltersDefs: DataTableGlobalFilter[],
  columnFiltersDefs: DataTableFilter[]
): string {
  const params = parseSearchParams(searchParams);

  delete params.pagination;
  if (state.pagination != null) {
    params.pagination = { ...state.pagination };
  }

  delete params.sorting;
  if (state.sorting != null) {
    params.sorting = state.sorting.map((sort) => ({
      column: sort.id,
      order: sort.desc ? 'desc' : 'asc',
    }));
  }

  // global filters
  const globalFilter = globalFilterSchema.parse(state.globalFilter);
  globalFiltersDefs.forEach(({ id }) => {
    delete params[id];
    const value = globalFilter[id];
    if (value != null) {
      params[id] = value;
    }
  });

  // filters
  columnFiltersDefs.forEach(({ id }) => {
    delete params[id];

    const columnFilter = state.columnFilters?.find((f) => f.id === id);
    const result = filterValueSchema.safeParse(columnFilter?.value);
    if (result.success) {
      params[id] = result.data;
    }
  });

  return stringifySearchParams(params);
}

type UseDataTableArgs<TData> = {
  columns: ColumnDef<TData>[];
  data: TData[];
  pagination?: PaginationState;
  pageCount?: number;
  sorting?: DataTableSorting<TData>[];
  globalFiltersDefs?: DataTableGlobalFilter[];
  globalFilter?: GlobalFilter;
  columnFiltersDefs?: DataTableFilter[];
  columnFilters?: Partial<Record<keyof TData, FilterValue>>;
};
export function useDataTable<TData>(
  args: UseDataTableArgs<TData>
): Table<TData> {
  const {
    columns,
    data,
    pagination,
    pageCount,
    sorting,
    globalFiltersDefs,
    globalFilter,
    columnFiltersDefs,
    columnFilters,
  } = args;

  const state: Partial<TableState> = {};
  if (pagination != null) {
    state.pagination = pagination;
  }
  if (sorting != null) {
    state.sorting = sorting.map((sort) => {
      return { id: String(sort.column), desc: sort.order === 'desc' };
    });
  }
  if (globalFilter != null) {
    state.globalFilter = globalFilter;
  }
  if (columnFilters != null) {
    state.columnFilters = Object.entries(columnFilters).map(([id, value]) => ({
      id,
      value,
    }));
  }

  // TODO: find a way to use hooks both from next/navigation and next/router
  const router = useRouter();
  const { pathname } = router;
  const searchParams = useSearchParams();

  const updateSearchParams = async (
    change: Partial<TableState>
  ): Promise<void> => {
    const params = stringifyTableState(
      { ...state, ...change },
      searchParams,
      globalFiltersDefs ?? [],
      columnFiltersDefs ?? []
    );

    await router.push(`${pathname}${params}`);
  };

  const handlePaginationChange: OnChangeFn<PaginationState> = async (
    updater
  ) => {
    if (typeof updater !== 'function' || state.pagination == null) {
      return;
    }

    await updateSearchParams({ pagination: updater(state.pagination) });
  };

  const handleSortingChange: OnChangeFn<SortingState> = async (updater) => {
    if (typeof updater !== 'function' || state.sorting == null) {
      return;
    }

    await updateSearchParams({ sorting: updater(state.sorting) });
  };

  const handleGlobalFilterChange: OnChangeFn<string> = async (updater) => {
    if (typeof updater === 'function') {
      return;
    }

    await updateSearchParams({
      ...(state.pagination != null && {
        pagination: { pageIndex: 0, pageSize: state.pagination.pageSize },
      }),
      globalFilter: updater,
    });
  };

  const handleColumnFiltersChange: OnChangeFn<ColumnFiltersState> = async (
    updater
  ) => {
    if (typeof updater !== 'function' || state.columnFilters == null) {
      return;
    }

    await updateSearchParams({
      ...(state.pagination != null && {
        pagination: { pageIndex: 0, pageSize: state.pagination.pageSize },
      }),
      columnFilters: updater(state.columnFilters),
    });
  };

  const table = useReactTable({
    columns,
    data,
    defaultColumn: {
      enableSorting: false,
      enableHiding: false,
      enableColumnFilter: false,
      enableGlobalFilter: false,
    },
    getCoreRowModel: getCoreRowModel(),
    pageCount,
    manualPagination: true,
    onPaginationChange: handlePaginationChange,
    manualSorting: true,
    onSortingChange: handleSortingChange,
    manualFiltering: true,
    onGlobalFilterChange: handleGlobalFilterChange,
    onColumnFiltersChange: handleColumnFiltersChange,
    state,
  });

  return table;
}
