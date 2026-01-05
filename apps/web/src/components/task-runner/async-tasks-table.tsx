import { useGetAllAsyncTasks } from '@meltstudio/client-common';
import type { FC } from 'react';

import { DataTable } from '@/ui/data-table';

import { useAsyncTasksColumns } from './async-tasks-columns';

export const AsyncTasksTable: FC = () => {
  const { data, isLoading } = useGetAllAsyncTasks();

  const columns = useAsyncTasksColumns();

  return <DataTable columns={columns} data={data} loading={isLoading} />;
};
