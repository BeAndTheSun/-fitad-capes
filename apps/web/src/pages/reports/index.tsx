import { DownloadIcon } from '@radix-ui/react-icons';
import type { AccessorKeyColumnDef } from '@tanstack/react-table';
import { createColumnHelper } from '@tanstack/react-table';
import type { GetServerSideProps, NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { ReportStatusEnum } from '@/common-types/reports';
import { AlgoliaTable, AlgoliaTableWrapper } from '@/components/algolia-table';
import { GenerateReportSidebar } from '@/components/reports/generate-report-sidebar';
import { useSessionUser } from '@/components/user/user-context';
import type { DbReports } from '@/db/schema';
import { FeatureFlagWrapper } from '@/feature-flags/feature-flag-wrapper';
import { FeatureFlag } from '@/feature-flags/feature-flags';
import { Button } from '@/theme/components/ui/button';
import { cn } from '@/theme/utils';
import type { TableFilter } from '@/types/data-table';
import { AlgoliaTableColumnHeader } from '@/ui/algolia-table';
import { useAlgoliaRefresh } from '@/ui/index';
import { handleDate } from '@/utils/date-utils';
import {
  getLocalizedReportStatusName,
  getLocalizedReportTableName,
} from '@/utils/localization';

const columnsHelper = createColumnHelper<DbReports>();

const useColumns = (): AccessorKeyColumnDef<DbReports, string>[] => {
  const { t } = useTranslation();

  return useMemo(
    () => [
      columnsHelper.accessor('name', {
        header: ({ column }) => (
          <AlgoliaTableColumnHeader column={column} title={t('Title')} />
        ),
        enableHiding: true,
      }),
      columnsHelper.accessor('from', {
        header: ({ column }) => (
          <AlgoliaTableColumnHeader column={column} title={t('From')} />
        ),
        cell: ({ row }) => {
          return handleDate(row.original.from, false);
        },
        enableHiding: true,
      }),
      columnsHelper.accessor('to', {
        header: ({ column }) => (
          <AlgoliaTableColumnHeader column={column} title={t('To')} />
        ),
        cell: ({ row }) => {
          return handleDate(row.original.to, false);
        },
        enableHiding: true,
      }),
      columnsHelper.accessor('exportedTable', {
        header: ({ column }) => (
          <AlgoliaTableColumnHeader column={column} title={t('Table')} />
        ),
        cell: ({ row }) => {
          const table = row.original.exportedTable;
          const tableLocalized = getLocalizedReportTableName(t, table);
          return tableLocalized;
        },
        enableHiding: true,
      }),
      columnsHelper.accessor('reportStatus', {
        header: ({ column }) => (
          <AlgoliaTableColumnHeader column={column} title={t('Status')} />
        ),
        cell: ({ row }) => {
          const status = row.original.reportStatus as ReportStatusEnum;
          const statusLocalized = getLocalizedReportStatusName(t, status);
          return statusLocalized;
        },
        enableHiding: true,
      }),
      columnsHelper.accessor('createdAt', {
        header: ({ column }) => (
          <AlgoliaTableColumnHeader column={column} title={t('Created At')} />
        ),
        cell: ({ row }) => {
          return handleDate(row.original.createdAt, false);
        },
        enableSorting: true,
        enableHiding: true,
      }),
      columnsHelper.accessor('downloadUrl', {
        header: ({ column }) => (
          <AlgoliaTableColumnHeader column={column} title={t('Download')} />
        ),
        cell: ({ row }) => {
          const isDisabled =
            row.original.reportStatus !== ReportStatusEnum.DONE ||
            !row.original.downloadUrl;
          return (
            <Button
              asChild
              variant="default"
              className={cn(isDisabled && 'opacity-60 pointer-events-none')}
            >
              <a
                href={row.original.downloadUrl || ''}
                download
                onClick={(e) => {
                  if (isDisabled) e.preventDefault();
                }}
              >
                <DownloadIcon />
              </a>
            </Button>
          );
        },
      }),
    ],
    [t]
  );
};

const ReportsTable = ({
  onReportGenerated,
  shouldRefresh,
}: {
  onReportGenerated: () => void;
  shouldRefresh: number;
}): JSX.Element => {
  const { selectedWorkspace } = useSessionUser();

  const { t } = useTranslation();
  const columns = useColumns();
  const { refresh: refreshAlgolia } = useAlgoliaRefresh();

  useEffect(() => {
    if (shouldRefresh > 0) {
      const timeoutId = setTimeout(() => {
        // eslint-disable-next-line no-void
        void refreshAlgolia();
      }, 500);

      return () => clearTimeout(timeoutId);
    }
    return undefined;
  }, [shouldRefresh, refreshAlgolia]);

  const handleReportGenerated = useCallback((): void => {
    onReportGenerated();
  }, [onReportGenerated]);

  const ticketFilters: TableFilter[] = [
    {
      key: 'reportStatus',
      label: t('Filter by all status'),
      options: [
        { label: t('Pending'), value: 'pending' },
        { label: t('Done'), value: 'done' },
      ],
    },
  ];

  return (
    <AlgoliaTable
      columns={columns}
      withSearch
      withPagination
      searchPlaceholder={t('Search By Title')}
      filters={selectedWorkspace ? `workspaceId:${selectedWorkspace.id}` : ''}
      tableFilters={ticketFilters}
      actionButton={
        <GenerateReportSidebar onReportGenerated={handleReportGenerated} />
      }
      hasViewOptions
    />
  );
};

const Reports: NextPage = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleReportGenerated = useCallback((): void => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <div>
      <FeatureFlagWrapper flag={FeatureFlag.REPORTS_MODULE}>
        <AlgoliaTableWrapper indexName="reports">
          <ReportsTable
            onReportGenerated={handleReportGenerated}
            shouldRefresh={refreshKey}
          />
        </AlgoliaTableWrapper>
      </FeatureFlagWrapper>
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

export default Reports;
