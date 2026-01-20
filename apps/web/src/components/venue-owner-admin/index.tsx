import { useFetchMetrics } from '@meltstudio/client-common/src/sdk';
import { Typography } from '@meltstudio/ui';
import { HomeIcon } from '@radix-ui/react-icons';
import { Trans, useTranslation } from 'next-i18next';
import type { FC } from 'react';
import { useMemo } from 'react';

import { useSessionUser } from '@/components/user/user-context';
import { MetricLineChart, PieChart } from '@/ui/utils';

import { CardStats } from './card-stats';
import { VenueOwnerStats } from './venue-owner-stats';

enum Metric {
  TOTAL_VENUES_BY_OWNER = 'TOTAL_VENUES_BY_OWNER',
  SUPER_PARTICIPANTS_ON_VENUES_BY_OWNER = 'SUPER_PARTICIPANTS_ON_VENUES_BY_OWNER',
  TOP_3_VENUES_WITH_MOST_MEMBERS = 'TOP_3_VENUES_WITH_MOST_MEMBERS',
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b'];

type PieChartCardProps = {
  title: string;
  data: { name: string; value: number; color?: string }[];
  total: number;
};

const PieChartCard: FC<PieChartCardProps> = ({ title, data, total }) => {
  return (
    <div className="rounded-xl bg-white p-6 shadow dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <Typography.Paragraph className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </Typography.Paragraph>

        <div
          className="rounded-full p-3 shadow-sm"
          style={{ backgroundColor: '#3b82f6' }}
        >
          <HomeIcon className="size-6 text-white" />
        </div>
      </div>
      <PieChart data={data} total={total} />
    </div>
  );
};

export const VenueOnwerDashboard: FC = () => {
  const { t } = useTranslation();
  const { selectedWorkspace, user } = useSessionUser();

  const { data, error, isLoading } = useFetchMetrics({
    metric: Metric.TOTAL_VENUES_BY_OWNER,
    workspaceId: selectedWorkspace?.id ?? '',
    sessionUserId: user?.id ?? '',
  });

  const {
    data: venuesData,
    isLoading: isVenuesDataLoading,
    error: venuesDataError,
  } = useFetchMetrics({
    metric: Metric.SUPER_PARTICIPANTS_ON_VENUES_BY_OWNER,
    workspaceId: selectedWorkspace?.id ?? '',
    sessionUserId: user?.id ?? '',
  });

  const {
    data: topMembersData,
    isLoading: isTopMembersLoading,
    error: topMembersError,
  } = useFetchMetrics({
    metric: Metric.TOP_3_VENUES_WITH_MOST_MEMBERS,
    workspaceId: selectedWorkspace?.id ?? '',
    sessionUserId: user?.id ?? '',
  });

  const totalVenues = data?.[0]?.count ?? 0;
  const totalTopVenues = topMembersData?.[0]?.count ?? 0;

  const isLoadingData = isLoading || isVenuesDataLoading || isTopMembersLoading;
  const hasError = error || venuesDataError || topMembersError;

  const topVenuesData = useMemo(() => {
    return (
      topMembersData?.map((item, index) => ({
        name: item.label,
        value: item.count,
        color: COLORS[index] || '#3b82f6',
      })) ?? []
    );
  }, [topMembersData]);

  const formattedVenuesOverTimeData = useMemo(() => {
    return (
      venuesData?.map((item) => ({
        date: item.label,
        counts: item.count,
      })) ?? []
    );
  }, [venuesData]);

  if (isLoadingData) {
    return (
      <div>
        <Trans>Loading</Trans>...
      </div>
    );
  }

  if (hasError) {
    return (
      <div>
        <Trans>Error loading data</Trans>.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Typography.H3>
        <Trans>Venue Owner Dashboard</Trans>
      </Typography.H3>
      <Typography.Paragraph>
        <Trans>
          This is the venue owner dashboard. Here you can manage your venues and
          users.
        </Trans>
      </Typography.Paragraph>
      <VenueOwnerStats />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
        <CardStats title={t('Total Venues')} total={totalVenues} />
        <PieChartCard
          title={t('Top 3 Venues with Most Members')}
          data={topVenuesData}
          total={totalTopVenues}
        />
      </div>
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <Typography.H4 className="mb-4">
          <Trans>Super Participants on Venues by Owner</Trans>
        </Typography.H4>
        <MetricLineChart
          data={formattedVenuesOverTimeData}
          yAxisLabel={t('Super Participants')}
          xAxisLabel={t('Venues')}
        />
      </div>
    </div>
  );
};
