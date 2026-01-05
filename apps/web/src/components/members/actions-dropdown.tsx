import type { DbUser } from '@meltstudio/db';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  RemoveItemButton,
} from '@meltstudio/theme';
import { DotsVerticalIcon, GearIcon } from '@radix-ui/react-icons';
import { Trans, useTranslation } from 'next-i18next';
import type { FC } from 'react';
import React from 'react';

import { useSessionUser } from '@/components/user/user-context';

import type { UserWorkspacePropsForUpdateRole } from './update-role-dialog';

export type MemberToDelete = {
  id: string;
  name: string;
  email: string;
};

const DeleteMemberButton: FC<{
  user: DbUser;
  handleDeleteUser: (member: MemberToDelete) => void;
}> = ({ user, handleDeleteUser }) => {
  const { t } = useTranslation();
  const { user: data, isLoading } = useSessionUser();

  const isSelf = user.id === data?.id;
  const disabled = isSelf || isLoading;

  const handleDelete = (): void =>
    handleDeleteUser({
      id: user.id,
      name: user.name,
      email: user.email,
    });

  return (
    <RemoveItemButton
      onConfirmDelete={handleDelete}
      loading={disabled}
      label={t('user')}
    >
      <Trans>Delete User</Trans>
    </RemoveItemButton>
  );
};

export type ActionsDropdownProps = {
  user: DbUser;
  onClickUpdateRole: (workspaces: UserWorkspacePropsForUpdateRole) => void;
  onClickDeleteUser: (member: MemberToDelete) => void;
  role: string;
};

export const ActionsDropdown: React.FC<ActionsDropdownProps> = ({
  user,
  onClickUpdateRole,
  onClickDeleteUser,
  role,
}) => {
  const { user: sessionUser, isLoading, selectedWorkspace } = useSessionUser();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <DotsVerticalIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        <DropdownMenuItem
          key={`role-${user.id}`}
          onSelect={(): void => {
            if (selectedWorkspace) {
              onClickUpdateRole({
                userId: user.id,
                workspaceId: selectedWorkspace.id,
                role,
              });
            }
          }}
          className="cursor-pointer"
          disabled={user.id === sessionUser?.id || isLoading}
        >
          <div className="flex items-center justify-center gap-2 ">
            <GearIcon />
            <Trans>Update Role</Trans>
          </div>
        </DropdownMenuItem>
        <DeleteMemberButton user={user} handleDeleteUser={onClickDeleteUser} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
