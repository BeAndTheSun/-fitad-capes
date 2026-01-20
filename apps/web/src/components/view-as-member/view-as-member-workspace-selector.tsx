import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@meltstudio/theme';
import { Trans, useTranslation } from 'next-i18next';
import type { FC } from 'react';

import { useSessionUser } from '@/components/user/user-context';

import { useViewAsMember } from './view-as-member-context';

/**
 * Component for super admins to select a workspace when viewing as a role
 */
export const ViewAsMemberWorkspaceSelector: FC = () => {
  const { t } = useTranslation();
  const { workspaces } = useSessionUser();
  const { isViewingAsRole, viewAsWorkspaceId, setViewAsWorkspaceId } =
    useViewAsMember();

  if (!isViewingAsRole) {
    return null;
  }

  // Filter workspaces that have members
  const workspacesWithMembers = workspaces.filter((w) => w.id);

  if (workspacesWithMembers.length === 0) {
    return (
      <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
        <Trans>No workspaces available to view as member</Trans>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">
        <Trans>View in workspace:</Trans>
      </span>
      <Select
        value={viewAsWorkspaceId ?? ''}
        onValueChange={(value) => setViewAsWorkspaceId(value)}
      >
        <SelectTrigger className="w-[250px]">
          <SelectValue placeholder={t('Select workspace')} />
        </SelectTrigger>
        <SelectContent>
          {workspacesWithMembers.map((workspace) => (
            <SelectItem key={workspace.id} value={workspace.id}>
              {workspace.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
