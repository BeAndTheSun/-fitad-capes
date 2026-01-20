import { useGetRecord } from '@meltstudio/client-common';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@meltstudio/theme';
import { UserRoleEnum } from '@meltstudio/types';
import { DataTable, SimpleTooltip } from '@meltstudio/ui';
import type { workspaceAdminModelSchema } from '@meltstudio/zod-schemas';
import type { CellContext } from '@tanstack/react-table';
import { createColumnHelper } from '@tanstack/react-table';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { Trans, useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { createContext, useContext, useMemo } from 'react';
import type { z } from 'zod';

import { CreateSuperParticipantModal } from '@/components/admin/create-super-participant-modal';
import { DeleteRecord } from '@/components/admin/delete-record';
import { ManageSuperParticipantsModal } from '@/components/admin/manage-super-participants-modal';
import { useSessionUser } from '@/components/user/user-context';
import type { NextPageWithLayout } from '@/types/next';

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

const ActionsCell = ({
  id,
  onRefetch,
}: {
  id: string;
  onRefetch: () => void;
}): JSX.Element | null => {
  const { t } = useTranslation();

  if (!id) return null;

  return (
    <div className="flex justify-center">
      <SimpleTooltip content={t('Remove Workspace')}>
        <div>
          <DeleteRecord
            data={{ model: 'userWorkspaces', id }}
            onSuccessfulDelete={onRefetch}
          />
        </div>
      </SimpleTooltip>
    </div>
  );
};

const RefetchContext = createContext<() => void>(() => {});

const ActionsHeader = (): JSX.Element => {
  const { t } = useTranslation();
  return <div className="text-center">{t('Actions')}</div>;
};

const ActionsCellWrapper = ({
  row,
}: CellContext<WorkspaceUser, unknown>): JSX.Element | null => {
  const refetch = useContext(RefetchContext);
  return <ActionsCell id={row.original.id || ''} onRefetch={refetch} />;
};

const SuperParticipantPage: NextPageWithLayout = () => {
  const { user, selectedWorkspace } = useSessionUser();
  const { t } = useTranslation();
  const router = useRouter();

  const isTrainer =
    user?.isSuperAdmin || selectedWorkspace?.role === UserRoleEnum.ADMIN;

  const { data, refetch, isLoading } = useGetRecord(
    'workspace',
    selectedWorkspace?.id ?? ''
  );

  const users: WorkspaceUser[] = useMemo(() => {
    if (!data) return [];
    try {
      const workspaceData = data as z.infer<typeof workspaceAdminModelSchema>;
      return (
        (workspaceData.users?.filter(
          (u) => typeof u !== 'string'
        ) as unknown as WorkspaceUser[]) || []
      );
    } catch (e) {
      return [];
    }
  }, [data]);

  const superParticipants = useMemo(
    () => users.filter((u) => u.role === UserRoleEnum.MEMBER),
    [users]
  );

  const existingUserIds = useMemo(
    () => users.map((u) => u.userId || u.user?.id || '').filter(Boolean),
    [users]
  );

  // Pagination logic
  const { pageIndex, pageSize } = useMemo(() => {
    const { pagination } = router.query;

    if (typeof pagination !== 'string') {
      return { pageIndex: 0, pageSize: 10 };
    }

    try {
      const { pageIndex: parsedPageIndex, pageSize: parsedPageSize } =
        JSON.parse(pagination) as {
          pageIndex?: number;
          pageSize?: number;
        };
      return {
        pageIndex: Number(parsedPageIndex) || 0,
        pageSize: Number(parsedPageSize) || 10,
      };
    } catch {
      return { pageIndex: 0, pageSize: 10 };
    }
  }, [router.query]);

  const paginatedParticipants = useMemo(() => {
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    return superParticipants.slice(start, end);
  }, [superParticipants, pageIndex, pageSize]);

  const columnHelper = createColumnHelper<WorkspaceUser>();

  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row.user?.name, {
        id: 'name',
        header: t('Name'),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor((row) => row.user?.email, {
        id: 'email',
        header: t('Email'),
        cell: (info) => info.getValue(),
      }),
      columnHelper.display({
        id: 'actions',
        header: ActionsHeader,
        cell: ActionsCellWrapper,
      }),
    ],
    [columnHelper, t]
  );

  if (isLoading || !selectedWorkspace) {
    return (
      <div className="mt-8 flex flex-col gap-8">
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  if (!isTrainer) {
    return null;
  }

  return (
    <RefetchContext.Provider value={refetch}>
      <div>
        <h1 className="mb-6 text-2xl font-bold">
          <Trans>Super Participants</Trans>
        </h1>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              <Trans>Super Participants</Trans>
            </CardTitle>
            <div className="flex gap-2">
              <ManageSuperParticipantsModal
                workspaceId={selectedWorkspace.id}
                existingUserIds={existingUserIds}
                onSuccess={() => refetch()}
              />
              <CreateSuperParticipantModal
                workspaceId={selectedWorkspace.id}
                onSuccess={() => refetch()}
              />
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={paginatedParticipants}
              pageCount={Math.ceil(superParticipants.length / pageSize)}
              pagination={{
                pageIndex,
                pageSize,
              }}
            />
          </CardContent>
        </Card>
      </div>
    </RefetchContext.Provider>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  let props = {};

  if (context.locale != null) {
    const translations = await serverSideTranslations(context.locale);

    props = { ...props, ...translations };
  }

  return { props };
};

export default SuperParticipantPage;
