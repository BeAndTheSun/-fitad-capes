import { useGetAllAsyncTasksByModel } from '@meltstudio/client-common';
import type { FC } from 'react';

import type { DbModelKeys } from '@/db/models/db';
import { DataTable } from '@/ui/data-table';

import { useAsyncTasksColumns } from './async-tasks-columns';

type Props = {
  modelName: DbModelKeys;
};

export const AsyncTasksByModelTable: FC<Props> = ({ modelName }) => {
  const { data, isLoading } = useGetAllAsyncTasksByModel({
    params: {
      modelName,
    },
  });

  const columns = useAsyncTasksColumns();

  return <DataTable columns={columns} data={data} loading={isLoading} />;
};
