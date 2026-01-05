import { Input } from '@meltstudio/theme';
import type { Table } from '@tanstack/react-table';
import type { ChangeEventHandler } from 'react';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { z } from 'zod';

import { globalFilterSchema } from '@/ui/data-table/use-data-table';

import { setFilterValue } from './helpers';

const searchSchema = z.string().nonempty().catch('');

type DataTableSearchFilterProps<TData> = {
  table: Table<TData>;
  id: string;
  placeholder?: string;
};

export const DataTableSearchFilter = <TData,>(
  props: DataTableSearchFilterProps<TData>
): React.ReactNode => {
  const { table, id, placeholder = 'Search' } = props;

  const globalFilter = globalFilterSchema.parse(table.getState().globalFilter);
  const valueFromGlobalFilter = searchSchema.parse(globalFilter[id]);

  const [value, setValue] = useState(valueFromGlobalFilter);
  const update = useDebouncedCallback((newValue: string) => {
    setFilterValue(id, newValue, table, true);
  }, 500);

  // need to listen for changes in the url to clear the input value
  useEffect(() => {
    if (valueFromGlobalFilter == null || valueFromGlobalFilter === '') {
      setValue('');
    }
  }, [valueFromGlobalFilter]);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setValue(event.target.value ?? '');
    update(event.target.value ?? '');
  };

  return (
    <Input
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      className="h-8 w-[150px] lg:w-[250px]"
    />
  );
};
