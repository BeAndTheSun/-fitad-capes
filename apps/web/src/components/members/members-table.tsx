import {
  formatZodiosError,
  useWorkspaceMembers,
} from '@meltstudio/client-common';
import { UserRoleEnum } from '@meltstudio/types';
import {
  AlgoliaTableColumnHeader,
  DataTable,
  DataTableColumnHeader,
  useAlgoliaRefresh,
} from '@meltstudio/ui';
import { createColumnHelper } from '@tanstack/react-table';
import { useTranslation } from 'next-i18next';
import type { FC } from 'react';
import React, { useCallback, useMemo, useState } from 'react';

import { AlgoliaTable, AlgoliaTableWrapper } from '@/components/algolia-table';
import { useSessionUser } from '@/components/user/user-context';
import type { DbUserWithRole } from '@/db/schema';
import { handleDate } from '@/utils/date-utils';
import { getUserRoleName } from '@/utils/localization';

import type { MemberToDelete } from './actions-dropdown';
import { ActionsDropdown } from './actions-dropdown';
import { DeleteMemberModal } from './delete-member-modal';
import { InviteMemberButton } from './invite-member';
import type { UserWorkspacePropsForUpdateRole } from './update-role-dialog';
import { UpdateRoleDialog } from './update-role-dialog';

const columnHelper = createColumnHelper<DbUserWithRole>();

const USE_ALGOLIA = true;

type UseColumnsMemberTableProps = {
  onClickUpdateRole: (user: UserWorkspacePropsForUpdateRole) => void;
  onClickDeleteUser: (member: MemberToDelete) => void;
  workspaceId: string;
};

const useColumnsMemberTable = ({
  onClickUpdateRole,
  onClickDeleteUser,
  workspaceId,
  // type of the columns object is very specific, it's better to allow TS to infer the correct type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
}: UseColumnsMemberTableProps) => {
  const { t } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const getHeader = () => {
    if (USE_ALGOLIA) {
      return AlgoliaTableColumnHeader;
    } else {
      return DataTableColumnHeader;
    }
  };
  const columns = useMemo(() => {
    return [
      columnHelper.accessor('name', {
        header: ({ column }) => (
          <>{getHeader()({ column, title: t('Name') })}</>
        ),
        enableHiding: true,
      }),
      columnHelper.accessor('email', {
        header: ({ column }) => (
          <>{getHeader()({ column, title: t('Email') })}</>
        ),
        enableHiding: true,
      }),
      columnHelper.accessor(
        (row) => {
          const workspace = row.workspaces.find((w) => {
            if ('id' in w) {
              return w.id === workspaceId;
            }
            return w.workspaceId === workspaceId;
          });
          const role = workspace?.role
            ? getUserRoleName(t, workspace.role as UserRoleEnum)
            : t('No role');

          return role;
        },
        {
          id: 'role',
          header: ({ column }) => (
            <>{getHeader()({ column, title: t('Role') })}</>
          ),
          enableHiding: true,
        }
      ),
      columnHelper.accessor('active', {
        header: ({ column }) => (
          <>{getHeader()({ column, title: t('Active') })}</>
        ),
        cell: ({ getValue }) => (getValue() ? t('Yes') : t('No')),
        enableHiding: true,
      }),
      columnHelper.accessor('createdAt', {
        header: ({ column }) => (
          <>{getHeader()({ column, title: t('Created At') })}</>
        ),
        cell: (context) => {
          const createdAt = context.getValue();
          return handleDate(createdAt, false);
        },
        enableSorting: true,
        enableHiding: true,
      }),
      columnHelper.display({
        header: t('Actions'),
        id: 'actions',
        cell: ({ row }) => {
          const workspace = row.original.workspaces.find((w) => {
            if ('id' in w) {
              return w.id === workspaceId;
            }
            return w.workspaceId === workspaceId;
          });
          const role = workspace?.role || UserRoleEnum.MEMBER;
          return (
            <div className="text-center">
              <ActionsDropdown
                role={role}
                user={row.original}
                key={row.original.id}
                onClickUpdateRole={onClickUpdateRole}
                onClickDeleteUser={onClickDeleteUser}
              />
            </div>
          );
        },
      }),
    ];
  }, [t, onClickUpdateRole, onClickDeleteUser, workspaceId]);
  return columns;
};

export const MembersDataTable: FC = () => {
  const { selectedWorkspace } = useSessionUser();
  const { refresh } = useAlgoliaRefresh();

  const isAlogiliaUsed = !USE_ALGOLIA && !!selectedWorkspace;

  const { data, error, isLoading, refetch } = useWorkspaceMembers({
    workspaceId: selectedWorkspace?.id ?? '',
    enabled: isAlogiliaUsed,
  });

  const [openUpdateRoleDialog, setOpenUpdateRoleDialog] = useState(false);
  const [openDeleteMemberModal, setOpenDeleteMemberModal] = useState(false);
  const [selectedUserWorkspaces, setSelectedUserWorkspaces] = useState<
    UserWorkspacePropsForUpdateRole | undefined
  >(undefined);
  const [memberToDelete, setMemberToDelete] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);

  const onClickUpdateRole = useCallback(
    (userWorkspace: UserWorkspacePropsForUpdateRole): void => {
      setOpenUpdateRoleDialog(true);
      setSelectedUserWorkspaces(userWorkspace);
    },
    []
  );

  const onClickDeleteUser = useCallback(
    (member: { id: string; name: string; email: string }): void => {
      setMemberToDelete(member);
      setOpenDeleteMemberModal(true);
    },
    []
  );

  const columns = useColumnsMemberTable({
    onClickUpdateRole,
    onClickDeleteUser,
    workspaceId: selectedWorkspace?.id ?? '',
  });

  if (USE_ALGOLIA) {
    return (
      <>
        <AlgoliaTable
          columns={columns}
          withSearch
          withPagination
          filters={
            selectedWorkspace ? `workspaces.id:${selectedWorkspace.id}` : ''
          }
          searchPlaceholder="Search by name or email"
          actionButton={<InviteMemberButton />}
          hasViewOptions
        />

        <UpdateRoleDialog
          open={openUpdateRoleDialog}
          onOpenChange={setOpenUpdateRoleDialog}
          workspaces={selectedUserWorkspaces}
          onClose={refresh}
        />
        {memberToDelete && (
          <DeleteMemberModal
            open={openDeleteMemberModal}
            onOpenChange={setOpenDeleteMemberModal}
            member={memberToDelete}
            onSuccessfulDelete={refresh}
          />
        )}
      </>
    );
  } else {
    return (
      <>
        <DataTable
          columns={columns}
          data={data ?? []}
          loading={isLoading}
          error={formatZodiosError('workspaceMembers', error)?.error}
          actionButton={<InviteMemberButton />}
        />
        <UpdateRoleDialog
          open={openUpdateRoleDialog}
          onOpenChange={setOpenUpdateRoleDialog}
          workspaces={selectedUserWorkspaces}
          onClose={refetch}
        />
        {memberToDelete && (
          <DeleteMemberModal
            open={openDeleteMemberModal}
            onOpenChange={setOpenDeleteMemberModal}
            member={memberToDelete}
            onSuccessfulDelete={refetch}
          />
        )}
      </>
    );
  }
};

export const MembersTable: FC = () => {
  return (
    <AlgoliaTableWrapper indexName="users">
      <MembersDataTable />
    </AlgoliaTableWrapper>
  );
};
