import { useParsedSearchParams } from '@meltstudio/core';
import type { ColumnDef } from '@tanstack/react-table';
import { createColumnHelper } from '@tanstack/react-table';
import type { GetServerSideProps } from 'next';
import Link from 'next/link';
import type { TFunction } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { z } from 'zod';

import { formatZodiosError, useGetVenuesOfUser } from '@/client-common/sdk';
import { useSessionUser } from '@/components/user/user-context';
import type { DbVenue } from '@/db/schema';
import { Button } from '@/theme/index';
import type { NextPageWithLayout } from '@/types/next';
import { DataTable, DataTableColumnHeader } from '@/ui/data-table';

type UseColumnsProps = {
  t: TFunction;
};

const searchParamsSchema = z.object({
  pagination: z
    .object({
      pageIndex: z.number().int().nonnegative(),
      pageSize: z.number().int().positive(),
    })
    .catch({ pageIndex: 0, pageSize: 10 }),
});

const columnsHelper = createColumnHelper<DbVenue>();

const useCreateColumns = ({ t }: UseColumnsProps): ColumnDef<DbVenue>[] => {
  return useMemo(
    () =>
      [
        columnsHelper.accessor('name', {
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title={t('Name')} />
          ),
        }),

        columnsHelper.accessor('description', {
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title={t('Description')} />
          ),
          cell: ({ row }) => {
            const { description } = row.original;
            return description ? (
              <span className="line-clamp-2" title={description}>
                {description}
              </span>
            ) : (
              '-'
            );
          },
        }),

        columnsHelper.accessor('city', {
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title={t('City')} />
          ),
          cell: ({ row }) => row.original.city ?? '-',
        }),

        columnsHelper.accessor('country', {
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title={t('Country')} />
          ),
          cell: ({ row }) => row.original.country ?? '-',
        }),

        columnsHelper.accessor('address', {
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title={t('Address')} />
          ),
          cell: ({ row }) => row.original.address ?? '-',
        }),

        columnsHelper.accessor('isActive', {
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title={t('Status')} />
          ),
          cell: ({ row }) => {
            const { isActive } = row.original;
            return (
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                }`}
              >
                {isActive ? t('Active') : t('Inactive')}
              </span>
            );
          },
        }),

        columnsHelper.accessor('brand_color', {
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title={t('Brand Color')} />
          ),
          cell: ({ row }) => {
            const color = row.original.brand_color;
            return color ? (
              <div className="flex items-center gap-2">
                <div
                  className="size-5 rounded-full border border-gray-300"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm">{color}</span>
              </div>
            ) : (
              '-'
            );
          },
        }),

        columnsHelper.display({
          id: 'actions',
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title={t('Actions')} />
          ),
          cell: ({ row }) => {
            const { id } = row.original;
            return (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/manage-venues/${id}`}>{t('Edit')}</Link>
                </Button>
              </div>
            );
          },
        }),
      ] as ColumnDef<DbVenue>[],
    [t]
  );
};

const ManageVenuesPage: NextPageWithLayout = () => {
  const { t } = useTranslation();
  const { user } = useSessionUser();
  const searchParams = useParsedSearchParams(searchParamsSchema);

  const { data, isLoading, error } = useGetVenuesOfUser({
    userId: user?.id ?? '',
  });

  const columns = useCreateColumns({ t });

  const pageCount = data?.length
    ? Math.ceil(data.length / searchParams.pagination.pageSize)
    : 0;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">
        <Trans>Manage Venues</Trans>
      </h1>
      <h3>
        <Trans>Manage your venues edit and delete them</Trans>
      </h3>
      <div className="mb-4">
        <DataTable
          columns={columns}
          data={(data as DbVenue[]) ?? []}
          loading={isLoading}
          error={formatZodiosError('getVenuesOfUser', error)?.error}
          pagination={searchParams.pagination}
          pageCount={pageCount}
          pageSizeOptions={[10, 20, 50]}
        />
      </div>
    </div>
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

export default ManageVenuesPage;
