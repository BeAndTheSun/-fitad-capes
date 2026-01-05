import {
  useAddUserFeatureFlag,
  useDeleteUserFeatureFlag,
  useGetUsersWithFeatureFlag,
  useListUsers,
  useToggleUserFeatureFlag,
} from '@meltstudio/client-common';
import { TrashIcon } from '@radix-ui/react-icons';
import { createColumnHelper } from '@tanstack/react-table';
import { Trans, useTranslation } from 'next-i18next';
import type { FC, MouseEventHandler } from 'react';
import { useMemo, useState } from 'react';

import { useSessionUser } from '@/components/user/user-context';
import type { DbUserFeatureFlagsWithUserName } from '@/db/models';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from '@/theme/index';
import { DataTable, DataTableColumnHeader } from '@/ui/data-table';

const UserFeatureFlagSwitch: React.FC<{
  userId: string;
  featureFlagId: string;
  released: boolean;
}> = ({ featureFlagId, userId, released }) => {
  const { selectedWorkspace } = useSessionUser();

  const { mutateAsync, isLoading } = useToggleUserFeatureFlag();
  const { refetch, isFetching } = useGetUsersWithFeatureFlag({
    params: { featureFlagId, workspaceId: selectedWorkspace?.id || '' },
  });

  const handleToggleFeatureFlag: MouseEventHandler<
    HTMLButtonElement
  > = async (): Promise<void> => {
    await mutateAsync({ featureFlagId, userId, released: !released });
    await refetch();
  };

  return (
    <Switch
      key={userId}
      checked={released}
      onClick={handleToggleFeatureFlag}
      disabled={isLoading || isFetching}
    />
  );
};

const RemoveUserFeatureFlagButton: React.FC<{
  featureFlagId: string;
  userId: string;
}> = ({ featureFlagId, userId }) => {
  const { selectedWorkspace } = useSessionUser();

  const { mutateAsync, isLoading } = useDeleteUserFeatureFlag({
    params: { workspaceId: selectedWorkspace?.id || '' },
  });
  const { refetch, isFetching } = useGetUsersWithFeatureFlag({
    params: {
      workspaceId: selectedWorkspace?.id || '',
      featureFlagId,
    },
  });

  const handleDeleteFeatureFlag: MouseEventHandler<
    HTMLButtonElement
  > = async (): Promise<void> => {
    await mutateAsync({ featureFlagId, userId });
    await refetch();
  };

  return (
    <Button
      variant="destructive"
      onClick={handleDeleteFeatureFlag}
      disabled={isLoading || isFetching}
    >
      <TrashIcon />
    </Button>
  );
};

const columnsHelper = createColumnHelper<DbUserFeatureFlagsWithUserName>();
// type of the columns object is very specific, it's better to allow TS to infer the correct type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const useColumns = () => {
  const { t } = useTranslation();

  const columns = useMemo(
    () => [
      columnsHelper.accessor('user.name', {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('User')} />
        ),
      }),

      columnsHelper.accessor('released', {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('Released')} />
        ),
        cell: ({ row }) => (
          <UserFeatureFlagSwitch
            featureFlagId={row.original.featureFlagId}
            userId={row.original.userId}
            released={row.original.released}
            key={row.original.userId}
          />
        ),
      }),

      columnsHelper.accessor('userId', {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('Actions')} />
        ),
        cell: ({ row }) => (
          <RemoveUserFeatureFlagButton
            key={row.original.userId}
            featureFlagId={row.original.featureFlagId}
            userId={row.original.userId}
          />
        ),
      }),
    ],
    [t]
  );

  return columns;
};

type Props = {
  open: boolean;
  featureFlagId: string;
  onOpenChange: (open: boolean) => void;
};

export const FeatureFlagDetailsModal: FC<Props> = ({
  open,
  featureFlagId,
  onOpenChange,
}) => {
  const [selectedUser, setSelectedUser] = useState<string>('');

  const { selectedWorkspace } = useSessionUser();
  const { data: users, isLoading: usersLoading } = useListUsers();
  const { mutateAsync, isLoading: addingUser } = useAddUserFeatureFlag({
    params: {
      workspaceId: selectedWorkspace?.id || '',
    },
  });
  const { data, isLoading, refetch } = useGetUsersWithFeatureFlag({
    params: {
      workspaceId: selectedWorkspace?.id || '',
      featureFlagId,
    },
  });
  const columns = useColumns();

  const handleSetSelectedUser = (value: string): void => {
    setSelectedUser(value);
  };

  const handleAddUser = async (): Promise<void> => {
    if (!selectedUser) return;

    await mutateAsync({
      userId: selectedUser,
      featureFlagId,
      released: false,
    });

    await refetch();

    setSelectedUser('');
  };

  const userName = users?.items?.find((user) => user.id === selectedUser)?.name;
  const usersList = users?.items?.filter((user) =>
    data?.data.every((userFlag) => userFlag.userId !== user.id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>
          <Trans>Feature Flag Details</Trans>
        </DialogTitle>
        <div className="flex flex-row gap-2">
          <Select
            value={selectedUser}
            disabled={usersLoading || addingUser}
            onValueChange={handleSetSelectedUser}
          >
            <SelectTrigger>
              <SelectValue>
                {userName || (
                  <p>
                    <Trans>Select an user to add</Trans>
                  </p>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {usersList?.map((user) => (
                <SelectItem value={user.id}>{user.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAddUser} disabled={usersLoading || addingUser}>
            <Trans>Add</Trans>
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={data?.data ?? []}
          loading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
};
