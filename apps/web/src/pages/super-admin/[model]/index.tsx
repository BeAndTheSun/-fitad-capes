import { useGetRecords } from '@meltstudio/client-common';
import { Button } from '@meltstudio/theme';
import type { DataTableColumnHeaderProps } from '@meltstudio/ui';
import {
  AlgoliaTableColumnHeader,
  DataTable,
  DataTableColumnHeader,
  useAlgoliaRefresh,
} from '@meltstudio/ui';
import type { AnyModelType } from '@meltstudio/zod-schemas';
import { Pencil1Icon } from '@radix-ui/react-icons';
import type { ColumnDef } from '@tanstack/react-table';
import { createColumnHelper } from '@tanstack/react-table';
import type { GetServerSideProps } from 'next';
import Link from 'next/link';
import type { TFunction } from 'next-i18next';
import { Trans, useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { FC } from 'react';
import { useMemo } from 'react';

import { DeleteRecord } from '@/components/admin/delete-record';
import { AlgoliaTable, AlgoliaTableWrapper } from '@/components/algolia-table';
import { modelsConfig } from '@/config/super-admin';
import { useModelByRoute } from '@/hooks/use-model-by-route';
import type { NextPageWithLayout } from '@/types/next';

const columnHelper = createColumnHelper<AnyModelType>();

const USE_ALGOLIA = false;

type UseColumnsProps = {
  modelName: string;
  urlModel: string;
  t: TFunction;
  refetch: () => void;
};

const useColumns = ({
  modelName,
  urlModel,
  t,
  refetch,
}: UseColumnsProps): ColumnDef<AnyModelType>[] => {
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

  return useMemo(() => {
    const baseColumns: ColumnDef<AnyModelType>[] = [
      ...(modelsConfig[modelName]?.fields || [])
        .filter(
          (field) =>
            field.type !== 'manyRelation' &&
            !['password', 'id'].includes(field.key.toLowerCase())
        )
        .map((field) =>
          columnHelper.accessor(field.key, {
            id: `${modelName}-${field.key}`,
            header: ({ column }) => (
              <HeaderComponent column={column} title={field.label} />
            ),
            cell: (context) => {
              const value = context.getValue<string | number | boolean>();

              if (field.type === 'boolean') {
                return value ? t('Yes') : t('No');
              }
              return value;
            },
          })
        ),
      columnHelper.accessor('id', {
        id: `${modelName}-actions`,
        header: ({ column }) => (
          <HeaderComponent column={column} title={t('Action')} />
        ),
        cell: (context) => {
          const id = context.getValue<string>();
          return (
            <Link href={`/super-admin/${urlModel}/${id}`}>
              <Pencil1Icon />
            </Link>
          );
        },
      }),
    ];
    if (modelName !== 'globalFeatureFlags') {
      baseColumns.push(
        columnHelper.accessor('id', {
          id: `${modelName}-delete`,
          header: ({ column }) => (
            <HeaderComponent column={column} title={t('Delete')} />
          ),
          cell: (context) => {
            const id = context.getValue<string>();
            return (
              <DeleteRecord
                data={{ model: modelName, id }}
                onSuccessfulDelete={refetch}
              />
            );
          },
        })
      );
    }

    return baseColumns;
  }, [HeaderComponent, modelName, refetch, t, urlModel]);
};

const AdminModelPageContent: FC = () => {
  const { model, modelName } = useModelByRoute();
  const { t } = useTranslation();

  const { data, error, isLoading, refetch } = useGetRecords({
    model: modelName,
    enabled: !!model,
  });

  const { refresh } = useAlgoliaRefresh();

  const columns = useColumns({
    modelName,
    urlModel: model?.url || '',
    t,
    refetch: USE_ALGOLIA ? refresh : refetch,
  });

  if (!model || !modelsConfig[modelName]) {
    return <div>Model not found</div>;
  }

  const commonComponent = (
    <div className="flex items-center justify-between pb-2">
      <h1>{modelsConfig[modelName]?.displayName || t('Model')}</h1>
      <div className="flex gap-2">
        {modelName !== 'globalFeatureFlags' && (
          <Button>
            <Link
              href={
                model.url === 'workspace'
                  ? '/super-admin/wizard'
                  : `/super-admin/${model.url}/create`
              }
            >
              <Trans>Create</Trans>
            </Link>
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div>
      {commonComponent}
      {USE_ALGOLIA ? (
        <AlgoliaTable columns={columns} hasViewOptions={false} />
      ) : (
        <DataTable
          columns={columns}
          data={data ?? []}
          error={error ? error.message : null}
          loading={isLoading}
        />
      )}
    </div>
  );
};

const AdminModelPage: NextPageWithLayout = () => {
  const { model, modelName, indexName } = useModelByRoute();

  if (!model || !modelsConfig[modelName]) {
    return (
      <div>
        <Trans>Model not found</Trans>
      </div>
    );
  }

  if (!indexName) {
    return (
      <div>
        <Trans>Index name not found</Trans>
      </div>
    );
  }

  return (
    <AlgoliaTableWrapper indexName={indexName} key={indexName}>
      <AdminModelPageContent />
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

export default AdminModelPage;
