import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

import type { UserRoleEnum } from '@/common-types/auth';

type WorkspaceData = {
  id: string;
  name: string;
  role: UserRoleEnum;
};

export type UseWorkspacesReturn = {
  changeToNewWorkspace: (workspace: WorkspaceData) => Promise<void>;
};

export const useWorkspaces = (): UseWorkspacesReturn => {
  const { data: session, update } = useSession();
  const router = useRouter();
  const changeToNewWorkspace = async (
    workspace: WorkspaceData
  ): Promise<void> => {
    await update({
      user: {
        ...session?.user,
        selectedWorkspace: {
          id: workspace.id,
          name: workspace.name,
          role: workspace.role,
        },
      },
    });
    await router.push('/');
  };

  return {
    changeToNewWorkspace,
  };
};
