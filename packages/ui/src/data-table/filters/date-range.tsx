import type { Table } from '@tanstack/react-table';
import type { Matcher, SelectRangeEventHandler } from 'react-day-picker';
import { z } from 'zod';

import { DateRangePicker } from '@/theme/index';
import { globalFilterSchema } from '@/ui/data-table/use-data-table';

import { setFilterValue } from './helpers';

const dateRangeSchema = z
  .object({
    from: z.date(),
    to: z.date().optional(),
  })
  .optional()
  .catch(undefined);

type DataTableDateRangeFilterProps<TData> = {
  table: Table<TData>;
  id: string;
  disabledDays?: 'past' | 'future';
};

export const DataTableDateRangeFilter = <TData,>(
  props: DataTableDateRangeFilterProps<TData>
): React.ReactNode => {
  const { table, id, disabledDays } = props;

  const globalFilter = globalFilterSchema.parse(table.getState().globalFilter);
  const value = dateRangeSchema.parse(globalFilter[id]);

  const handleSelect: SelectRangeEventHandler = (range) => {
    setFilterValue(id, range, table, true);
  };

  const disabled: Matcher[] = [];
  if (disabledDays === 'past') {
    disabled.push({ before: new Date() });
  } else if (disabledDays === 'future') {
    disabled.push({ after: new Date() });
  }

  return (
    <DateRangePicker
      size="sm"
      selected={value}
      onSelect={handleSelect}
      disabled={disabled}
      showOutsideDays={false}
    />
  );
};
