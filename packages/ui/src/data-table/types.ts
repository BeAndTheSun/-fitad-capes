import type { Column } from '@tanstack/react-table';
import type { ReactNode } from 'react';

export type DataTableSorting<TData> = {
  column: keyof TData;
  order: 'asc' | 'desc';
};

export type DataTableSearchFilter = {
  type: 'search';
  id: string;
  placeholder?: string;
};

export type DataTableSelectOption = {
  label: string;
  value: string;
};

export type DataTableSelectFilter = {
  type: 'select';
  id: string;
  title: string;
  allowMultiple?: boolean;
  options: DataTableSelectOption[];
};

export type DataTableDateRangeFilter = {
  type: 'date-range';
  id: string;
  disabledDays?: 'past' | 'future';
};

export type DataTableFilter = DataTableSelectFilter;
export type DataTableGlobalFilter =
  | DataTableSearchFilter
  | DataTableSelectFilter
  | DataTableDateRangeFilter;

export type DataTableColumnHeaderProps<TData, TValue> = {
  column: Column<TData, TValue>;
  title: ReactNode;
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>;
