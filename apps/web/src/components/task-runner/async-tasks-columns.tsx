import type { TaskImage } from '@meltstudio/tasks';
import { createColumnHelper } from '@tanstack/react-table';
import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';

import { DataTableColumnHeader } from '@/ui/data-table';

const columnHelper = createColumnHelper<TaskImage>();

// type of the columns object is very specific, it's better to allow TS to infer the correct type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
export const useAsyncTasksColumns = () => {
  const { t } = useTranslation();

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('ID')} />
        ),
      }),
      columnHelper.accessor('taskType', {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('Type')} />
        ),
      }),
      columnHelper.accessor('status', {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('Status')} />
        ),
      }),
      columnHelper.accessor('taskData', {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('Data')} />
        ),
        cell: ({ getValue }) => JSON.stringify(getValue()),
      }),
      columnHelper.accessor('createdAt', {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('Created at')} />
        ),
        cell: ({ getValue }) => new Date(getValue()).toLocaleString(),
      }),
    ],
    [t]
  );

  return columns;
};
