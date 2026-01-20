import { useGetRecord } from '@meltstudio/client-common';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@meltstudio/theme';
import { UserRoleEnum } from '@meltstudio/types';
import type { workspaceAdminModelSchema } from '@meltstudio/zod-schemas';
import { Trans } from 'next-i18next';
import type { FC } from 'react';
import { useMemo } from 'react';
import type { z } from 'zod';

import { ChangeTrainerModal } from './change-trainer-modal';
import { CreateSuperParticipantModal } from './create-super-participant-modal';
import { DeleteRecord } from './delete-record';
import { ManageSuperParticipantsModal } from './manage-super-participants-modal';

export type WorkspaceUser = {
  role: UserRoleEnum;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  userId?: string;
  id?: string; // ID of the UserWorkspace record
};

type WorkspaceUserManagementProps = {
  workspaceId: string;
};

export const WorkspaceUserManagement: FC<WorkspaceUserManagementProps> = ({
  workspaceId,
}) => {
  const { data, refetch, isLoading } = useGetRecord('workspace', workspaceId);

  const users: WorkspaceUser[] = useMemo(() => {
    if (!data) return [];
    const workspaceData = data as z.infer<typeof workspaceAdminModelSchema>;
    return (
      (workspaceData.users?.filter(
        (u) => typeof u !== 'string'
      ) as unknown as WorkspaceUser[]) || []
    );
  }, [data]);

  const trainer = useMemo(
    () => users.find((u) => u.role === UserRoleEnum.ADMIN),
    [users]
  );

  const superParticipants = useMemo(
    () => users.filter((u) => u.role === UserRoleEnum.MEMBER),
    [users]
  );

  const existingUserIds = useMemo(
    () => users.map((u) => u.userId || u.user?.id || '').filter(Boolean),
    [users]
  );

  if (isLoading) {
    return (
      <div className="mt-8 flex flex-col gap-8">
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-col gap-8">
      {/* Trainer Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            <Trans>Trainer</Trans>
          </CardTitle>
          <ChangeTrainerModal
            workspaceId={workspaceId}
            existingUserIds={existingUserIds}
            currentTrainerId={trainer?.id}
            onSuccess={() => refetch()}
          />
        </CardHeader>
        <CardContent>
          {trainer ? (
            <div className="flex flex-col gap-1">
              <span className="font-medium">{trainer.user?.name}</span>
              <span className="text-sm text-muted-foreground">
                {trainer.user?.email}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground">
              <Trans>No trainer assigned</Trans>
            </span>
          )}
        </CardContent>
      </Card>

      {/* Super Participants Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            <Trans>Super Participants</Trans>
          </CardTitle>
          <div className="flex gap-2">
            <ManageSuperParticipantsModal
              workspaceId={workspaceId}
              existingUserIds={existingUserIds}
              onSuccess={() => refetch()}
            />
            <CreateSuperParticipantModal
              workspaceId={workspaceId}
              onSuccess={() => refetch()}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Trans>Name</Trans>
                </TableHead>
                <TableHead>
                  <Trans>Email</Trans>
                </TableHead>
                <TableHead className="w-[100px]">
                  <Trans>Actions</Trans>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {superParticipants.length > 0 ? (
                superParticipants.map((participant) => (
                  <TableRow key={participant.user?.id || participant.userId}>
                    <TableCell>{participant.user?.name}</TableCell>
                    <TableCell>{participant.user?.email}</TableCell>
                    <TableCell>
                      {participant.id && ( // Can only delete if we have the link ID
                        <DeleteRecord
                          data={{ model: 'userWorkspaces', id: participant.id }}
                          onSuccessfulDelete={() => refetch()}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-muted-foreground"
                  >
                    <Trans>No super participants found</Trans>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
