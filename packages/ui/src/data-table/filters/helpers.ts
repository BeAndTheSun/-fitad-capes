import type { Column, Table } from '@tanstack/react-table';

import type { FilterValue } from '@/ui/data-table/use-data-table';
import { globalFilterSchema } from '@/ui/data-table/use-data-table';

export function getColumn<TData>(
  id: string,
  table: Table<TData>
): Column<TData> {
  const column = table.getColumn(id);
  if (column == null) {
    throw new Error(`Could not find column '${id}'`);
  }
  if (!column.getCanFilter()) {
    throw new Error(`Column '${id}' cannot be filtered`);
  }

  return column;
}

export function getArrayFilterValue<TData>(
  id: string,
  table: Table<TData>,
  isGlobal: boolean
): Set<string> {
  if (isGlobal) {
    const globalFilter = globalFilterSchema.parse(
      table.getState().globalFilter
    );
    const value = globalFilter[id];
    if (value == null) {
      return new Set();
    }
    if (Array.isArray(value)) {
      return new Set(value.map((v) => String(v)));
    }

    return new Set([String(value)]);
  }

  const column = getColumn(id, table);
  const value = column.getFilterValue();
  if (value == null) {
    return new Set();
  }
  if (Array.isArray(value)) {
    return new Set(value.map((v) => String(v)));
  }

  return new Set([String(value)]);
}

export function updateArrayFilterValue(
  selectedValues: Set<string>,
  value: string,
  allowMultiple: boolean
): string[] {
  const removed = selectedValues.delete(value);
  if (!removed && value) {
    if (allowMultiple) {
      selectedValues.add(value);
    } else {
      return [value];
    }
  }

  return Array.from(selectedValues);
}

export function setFilterValue<TData>(
  id: string,
  value: FilterValue | undefined,
  table: Table<TData>,
  isGlobal: boolean
): void {
  if (isGlobal) {
    const globalFilter = globalFilterSchema.parse(
      table.getState().globalFilter
    );
    const newValue = {
      ...globalFilter,
      [id]: value,
    };
    if (
      value == null ||
      value === '' ||
      (Array.isArray(value) && value.length === 0)
    ) {
      delete newValue[id];
    }

    table.setGlobalFilter(newValue);
  } else {
    const column = getColumn(id, table);
    column.setFilterValue(value);
  }
}
