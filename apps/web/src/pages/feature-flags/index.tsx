import {
  formatZodiosError,
  useGetFeatureFlags,
  useToggleFeatureFlag,
} from '@meltstudio/client-common';
import { Switch } from '@meltstudio/theme';
import type { DataTableColumnHeaderProps } from '@meltstudio/ui';
import {
  AlgoliaTableColumnHeader,
  DataTable,
  DataTableColumnHeader,
  useAlgoliaRefresh,
} from '@meltstudio/ui';
import { createColumnHelper } from '@tanstack/react-table';
import type { GetServerSideProps } from 'next';
import type { TFunction } from 'next-i18next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { MouseEventHandler } from 'react';
import { useMemo } from 'react';

import { AlgoliaTable, AlgoliaTableWrapper } from '@/components/algolia-table';
import { useSessionUser } from '@/components/user/user-context';
import type { DbFeatureFlag } from '@/db/schema';
import type { FeatureFlag } from '@/feature-flags/index';
import type { NextPageWithLayout } from '@/types/next';
import {
  getLocalizedFeatureFlagDescription,
  getLocalizedFeatureFlagName,
} from '@/utils/localization';

type UseColumnsProps = {
  t: TFunction;
  refetch: () => void;
};

const USE_ALGOLIA = false;

const FeatureFlagSwitch: React.FC<{
  flag: DbFeatureFlag;
  refetch: () => void;
  disabled?: boolean;
}> = ({ flag, refetch, disabled }) => {
  const { mutateAsync, isLoading } = useToggleFeatureFlag();

  const handleToggleFeatureFlag: MouseEventHandler<
    HTMLButtonElement
  > = async (): Promise<void> => {
    await mutateAsync({ id: flag.id, released: !flag.released });
    refetch();
  };

  return (
    <Switch
      checked={flag.released}
      onClick={handleToggleFeatureFlag}
      disabled={isLoading || disabled}
      className={disabled ? 'cursor-not-allowed opacity-50' : ''}
    />
  );
};

type DbFeatureFlagWithControl = DbFeatureFlag & {
  allowWorkspaceControl: boolean;
};

const columnsHelper = createColumnHelper<DbFeatureFlagWithControl>();
// type of the columns object is very specific, it's better to allow TS to infer the correct type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const useCreateColumns = ({ t, refetch }: UseColumnsProps) => {
  const getHeader: () => <TData, TValue>(
    props: DataTableColumnHeaderProps<TData, TValue>
  ) => React.ReactNode = () => {
    if (USE_ALGOLIA) {
      return AlgoliaTableColumnHeader;
    } else {
      return DataTableColumnHeader;
    }
  };
  const HeaderComponent = getHeader();
  return useMemo(
    () => [
      columnsHelper.accessor('flag', {
        header: ({ column }) => (
          <HeaderComponent column={column} title={t('Flag')} />
        ),
        cell: ({ row }) => {
          const { flag } = row.original;
          return getLocalizedFeatureFlagName(t, flag as FeatureFlag);
        },
      }),

      columnsHelper.accessor('description', {
        header: ({ column }) => (
          <HeaderComponent column={column} title={t('Description')} />
        ),
        cell: ({ row }) => {
          const { flag } = row.original;
          return getLocalizedFeatureFlagDescription(t, flag as FeatureFlag);
        },
      }),

      columnsHelper.accessor('released', {
        header: ({ column }) => (
          <HeaderComponent column={column} title={t('Released')} />
        ),
        cell: ({ row }) => {
          const flag = row.original;
          const canControl = flag.allowWorkspaceControl ?? false;
          return (
            <FeatureFlagSwitch
              refetch={refetch}
              flag={flag}
              disabled={!canControl}
            />
          );
        },
      }),
    ],
    [HeaderComponent, refetch, t]
  );
};

const FeatureFlagsPageContent: NextPageWithLayout = () => {
  const { selectedWorkspace } = useSessionUser();
  const { t } = useTranslation();

  const isAlogiliaUsed = !USE_ALGOLIA && !!selectedWorkspace;

  const { data, error, isLoading, refetch } = useGetFeatureFlags({
    workspaceId: selectedWorkspace?.id ?? '',
    enabled: isAlogiliaUsed,
  });

  const { refresh } = useAlgoliaRefresh();

  const handleRefresh = async (): Promise<void> => {
    if (USE_ALGOLIA) {
      await refresh();
    } else {
      await refetch();
    }
  };

  const columns = useCreateColumns({ t, refetch: handleRefresh });

  const tableComponent = (): JSX.Element => {
    if (USE_ALGOLIA) {
      return (
        <AlgoliaTable
          columns={columns}
          filters={
            selectedWorkspace ? `workspaces.id:${selectedWorkspace.id}` : ''
          }
          hasViewOptions
        />
      );
    } else {
      return (
        <DataTable
          columns={columns}
          data={data?.flags ?? []}
          loading={isLoading}
          error={formatZodiosError('getFeatureFlags', error)?.error}
        />
      );
    }
  };

  return (
    <div>
      <div className="mb-4">{tableComponent()}</div>
    </div>
  );
};

const FeatureFlagsPage: NextPageWithLayout = () => {
  return (
    <AlgoliaTableWrapper indexName="feature_flag">
      <FeatureFlagsPageContent />
    </AlgoliaTableWrapper>
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

export default FeatureFlagsPage;
