'use client';

import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@meltstudio/theme';
import { MixerHorizontalIcon } from '@radix-ui/react-icons';
import type { Table } from '@tanstack/react-table';
import { Trans, useTranslation } from 'next-i18next';

import { getLocalizedColumnName } from '@/ui/utils/localization';

type DataTableViewOptionsProps<TData> = {
  table: Table<TData>;
};

export const DataTableViewOptions = <TData,>(
  props: DataTableViewOptionsProps<TData>
): React.ReactNode => {
  const { t } = useTranslation();
  const { table } = props;

  const columns = table
    .getAllColumns()
    .filter(
      (column) =>
        typeof column.accessorFn !== 'undefined' && column.getCanHide()
    );

  if (columns.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-2/4 font-normal">
          <MixerHorizontalIcon className="mr-2 size-4" />
          <Trans>View</Trans>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px]">
        <DropdownMenuLabel>
          <Trans>Toggle columns</Trans>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns.map((column) => {
          return (
            <DropdownMenuCheckboxItem
              key={column.id}
              className="capitalize"
              checked={column.getIsVisible()}
              onCheckedChange={(value): void =>
                column.toggleVisibility(!!value)
              }
            >
              {getLocalizedColumnName(t, column.id)}
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
