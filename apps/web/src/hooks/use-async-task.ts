import { useGetAsyncTask } from '@meltstudio/client-common';
import { useEffect, useState } from 'react';

import { TaskStatus } from '@/common-types/task-runner';

type UseAsyncTaskType<T> = {
  status: TaskStatus | null;
  result: T | null;
  loading: boolean;
  error: unknown;
};

export const useAsyncTask = <T>(id: string | null): UseAsyncTaskType<T> => {
  const [enabled, setEnabled] = useState<boolean>(!!id);

  const { data, refetch, error } = useGetAsyncTask({ id, enabled });

  useEffect(() => {
    const interval = setInterval(async () => {
      if (id) await refetch();
    }, 5000);

    if (
      data?.status === TaskStatus.DONE ||
      data?.status === TaskStatus.FAILED ||
      !!error
    ) {
      setEnabled(false);
      clearInterval(interval);
    }

    return () => {
      setEnabled(false);
      clearInterval(interval);
    };
  }, [data?.status, error, id, refetch]);

  // Casting to get correct results
  const taskResult =
    typeof data?.taskResult === 'string' ? data.taskResult : '{}';
  const result = JSON.parse(taskResult) as T;

  const loading =
    !!id &&
    !error &&
    [TaskStatus.PENDING, TaskStatus.PROCESSING].includes(
      data?.status || TaskStatus.PENDING
    );

  return {
    status: data?.status || null,
    result,
    loading,
    error,
  };
};
