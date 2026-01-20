import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@meltstudio/theme';
import { UserRoleEnum } from '@meltstudio/types';
import { useRouter } from 'next/router';
import { Trans, useTranslation } from 'next-i18next';
import type { FC } from 'react';
import { useEffect } from 'react';

import { useSessionUser } from '@/components/user/user-context';

import { useViewAsMember } from './view-as-member-context';

/**
 * Role selector for super admins
 * Allows selecting a role to view as (Trainer or Super Participant)
 * Workspace is selected separately via the workspace selector
 */
export const ViewAsSelector: FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { isSuperAdmin, selectedWorkspace } = useSessionUser();
  const {
    isViewingAsRole,
    viewAsRole,
    setViewAsRole,
    setViewAsWorkspaceId,
    disableViewAsRole,
  } = useViewAsMember();

  // When workspace changes while viewing as a role, update viewAsWorkspaceId
  useEffect(() => {
    if (isViewingAsRole && selectedWorkspace?.id) {
      setViewAsWorkspaceId(selectedWorkspace.id);
    }
  }, [isViewingAsRole, selectedWorkspace?.id, setViewAsWorkspaceId]);

  // When role changes, redirect if needed
  useEffect(() => {
    if (isViewingAsRole && viewAsRole && selectedWorkspace?.id) {
      if (router.asPath.startsWith('/super-admin')) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        router.push('/');
      }
    }
  }, [isViewingAsRole, viewAsRole, selectedWorkspace?.id, router]);

  // Only show for super admins
  if (!isSuperAdmin) {
    return null;
  }

  const handleRoleChange = (value: string): void => {
    if (value === 'none') {
      disableViewAsRole();
      if (!router.asPath.startsWith('/super-admin')) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        router.push('/super-admin');
      }
      return;
    }

    // Set the role and use the currently selected workspace
    setViewAsRole(value as UserRoleEnum.ADMIN | UserRoleEnum.MEMBER);
    if (selectedWorkspace?.id) {
      setViewAsWorkspaceId(selectedWorkspace.id);
    }
  };

  const selectValue = isViewingAsRole && viewAsRole ? viewAsRole : 'none';

  return (
    <div className="flex items-center gap-2">
      <span className="whitespace-nowrap text-sm font-medium">
        <Trans>View As:</Trans>
      </span>
      <Select value={selectValue} onValueChange={handleRoleChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder={t('Select role')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">
            <Trans>Super Admin View</Trans>
          </SelectItem>
          <SelectItem value={UserRoleEnum.ADMIN}>
            <Trans>Trainer</Trans>
          </SelectItem>
          <SelectItem value={UserRoleEnum.MEMBER}>
            <Trans>Super Participant</Trans>
          </SelectItem>
          <SelectItem value={UserRoleEnum.VENUE_OWNER}>
            <Trans>Venue Owner</Trans>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
