'use client';

import {
  Button,
  cn,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@meltstudio/theme';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons';
import type { Table } from '@tanstack/react-table';
import { Trans } from 'next-i18next';

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50];

type DataTablePaginationProps<TData> = {
  table: Table<TData>;
  pageSizeOptions?: number[];
};

export const DataTablePagination = <TData,>(
  props: DataTablePaginationProps<TData>
): React.ReactNode => {
  const { table, pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS } = props;

  const tableState = table.getState();
  const { pageSize, pageIndex } = tableState.pagination;
  const isSomeRowsSelected = table.getIsSomeRowsSelected();

  const handlePageSizeChange = (value: string): void => {
    table.setPageSize(parseInt(value, 10));
  };

  return (
    <div
      className={cn(
        'flex flex-col items-end px-2 space-y-2 md:flex-row md:space-y-0 md:items-center',
        isSomeRowsSelected ? 'md:justify-between' : 'md:justify-end'
      )}
    >
      {isSomeRowsSelected && (
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} <Trans>of</Trans>{' '}
          {table.getFilteredRowModel().rows.length} <Trans>row(s)</Trans>{' '}
          <Trans>selected</Trans>.
        </div>
      )}

      <div className="flex flex-col items-end space-y-2 md:flex-row md:space-x-6 md:space-y-0 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">
            <Trans>Rows per page</Trans>.
          </p>
          <Select
            value={pageSize.toString()}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((option) => (
                <SelectItem key={option} value={option.toString()}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-row items-center">
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            <Trans>Page</Trans> {pageIndex + 1} <Trans>of</Trans>{' '}
            {table.getPageCount()}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden size-8 p-0 lg:flex"
              onClick={(): void => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">
                <Trans>Go to first page</Trans>
              </span>
              <DoubleArrowLeftIcon className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="size-8 p-0"
              onClick={(): void => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">
                <Trans>Go to previous page</Trans>
              </span>
              <ChevronLeftIcon className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="size-8 p-0"
              onClick={(): void => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">
                <Trans>Go to next page</Trans>
              </span>
              <ChevronRightIcon className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 p-0 lg:flex"
              onClick={(): void => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">
                <Trans>Go to last page</Trans>
              </span>
              <DoubleArrowRightIcon className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
