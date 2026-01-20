import { useGetRecords } from '@meltstudio/client-common';
import { useMemo } from 'react';

import { useSessionUser } from '@/components/user/user-context';

type WorkspaceOption = {
  id: string;
  name: string;
};

/**
 * Hook for super admins to get all workspaces
 * Returns all workspaces in the system, not just the ones the user belongs to
 */
export function useAdminWorkspaces(): {
  workspaces: WorkspaceOption[];
  isLoading: boolean;
  error: Error | null;
} {
  const { isSuperAdmin } = useSessionUser();

  const { data, isLoading, error } = useGetRecords({
    model: 'workspace',
    enabled: isSuperAdmin,
    pagination: {
      pageIndex: 0,
      pageSize: 0, // Get all workspaces
    },
    filters: {},
  });

  const workspaces = useMemo<WorkspaceOption[]>(() => {
    if (!data?.items) return [];
    return (data.items as Array<{ id: string; name: string }>).map((ws) => ({
      id: ws.id,
      name: ws.name,
    }));
  }, [data]);

  return {
    workspaces,
    isLoading,
    error,
  };
}
