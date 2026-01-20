import { useFetchMetrics } from '@meltstudio/client-common/src/sdk';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  HomeIcon,
  PersonIcon,
} from '@radix-ui/react-icons';
import { Trans, useTranslation } from 'next-i18next';
import React, { useState } from 'react';

import { useSessionUser } from '@/components/user/user-context';
import { Typography } from '@/ui/typography';
import { MetricLineChart } from '@/ui/utils';

type Metric = {
  label: string;
  count: number;
};

type ExpandableCardProps = {
  title: string;
  total: number;
  items: { name: string }[];
  color: string;
  icon: React.ReactNode;
};

const ExpandableCard: React.FC<ExpandableCardProps> = ({
  title,
  total,
  items,
  color,
  icon,
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl bg-white p-6 shadow dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <Typography.Paragraph className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </Typography.Paragraph>

        <div
          className="rounded-full p-3 shadow-sm"
          style={{ backgroundColor: color }}
        >
          {icon}
        </div>
      </div>

      <Typography.H3 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
        {total}
      </Typography.H3>

      <div className="mt-4">
        <button
          type="button"
          className="flex w-full items-center justify-between text-left text-sm font-medium transition-opacity hover:opacity-80"
          onClick={() => setOpen(!open)}
        >
          <span>{t('View List')}</span>
          {open ? (
            <ChevronUpIcon className="size-4" />
          ) : (
            <ChevronDownIcon className="size-4" />
          )}
        </button>
        {open && (
          <ul className="ml-2 mt-2 max-h-60 space-y-1 overflow-auto text-sm text-gray-600 dark:text-gray-300">
            {items.length > 0 ? (
              items.map((item) => <li key={item.name}>• {item.name}</li>)
            ) : (
              <li>{t('No items available.')}</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export const MetricsDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { selectedWorkspace } = useSessionUser();

  const {
    data: usersOverTimeData,
    error: usersOverTimeError,
    isLoading: isUsersOverTimeLoading,
  } = useFetchMetrics({
    metric: 'USERS_OVER_TIME',
    workspaceId: selectedWorkspace?.id ?? '',
  });

  const {
    data: totalUsersData,
    error: totalUsersError,
    isLoading: isTotalUsersLoading,
  } = useFetchMetrics({
    metric: 'TOTAL_USERS',
    workspaceId: selectedWorkspace?.id ?? '',
  });

  const {
    data: usersPerVenueData,
    error: usersPerVenueError,
    isLoading: isUsersPerVenueLoading,
  } = useFetchMetrics({
    metric: 'USERS_PER_VENUE',
    workspaceId: selectedWorkspace?.id ?? '',
  });

  const {
    data: totalVenuesData,
    error: totalVenuesError,
    isLoading: isTotalVenuesLoading,
  } = useFetchMetrics({
    metric: 'TOTAL_VENUES',
    workspaceId: selectedWorkspace?.id ?? '',
  });

  const {
    data: usersListData,
    error: usersListError,
    isLoading: isUsersListLoading,
  } = useFetchMetrics({
    metric: 'USERS_LIST',
    workspaceId: selectedWorkspace?.id ?? '',
  });

  const {
    data: venuesListData,
    error: venuesListError,
    isLoading: isVenuesListLoading,
  } = useFetchMetrics({
    metric: 'VENUES_LIST',
    workspaceId: selectedWorkspace?.id ?? '',
  });

  const {
    data: venuesOverTimeData,
    error: venuesOverTimeError,
    isLoading: isVenuesOverTimeLoading,
  } = useFetchMetrics({
    metric: 'VENUES_OVER_TIME',
    workspaceId: selectedWorkspace?.id ?? '',
  });

  const isLoading =
    isUsersOverTimeLoading ||
    isTotalUsersLoading ||
    isUsersPerVenueLoading ||
    isTotalVenuesLoading ||
    isUsersListLoading ||
    isVenuesListLoading ||
    isVenuesOverTimeLoading;

  const hasError =
    usersOverTimeError ||
    totalUsersError ||
    usersPerVenueError ||
    totalVenuesError ||
    usersListError ||
    venuesListError ||
    venuesOverTimeError;

  if (isLoading) {
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

  const formatOverTimeData = (
    data?: Metric[]
  ): { date: string; counts: number }[] =>
    data?.map(({ label, count }) => ({
      date: label,
      counts: count,
    })) ?? [];

  const formattedUsersOverTimeData = formatOverTimeData(
    usersOverTimeData as Metric[]
  );
  const formattedVenuesOverTimeData = formatOverTimeData(
    venuesOverTimeData as Metric[]
  );

  const formattedUsersPerVenueData =
    (usersPerVenueData as Metric[])?.map((item: Metric) => ({
      name: item.label,
    })) ?? [];

  const getTotalCount = (data?: unknown): number =>
    Array.isArray(data) ? ((data[0] as Metric | undefined)?.count ?? 0) : 0;

  const totalUsersCount = getTotalCount(totalUsersData);
  const totalVenuesCount = getTotalCount(totalVenuesData);

  const usersList =
    (usersListData as Metric[])?.map((item) => ({ name: item.label })) ?? [];
  const venuesList =
    (venuesListData as Metric[])?.map((item) => ({ name: item.label })) ?? [];

  return (
    <div className="space-y-8">
      <Typography.H3>
        <Trans>Trainer Dashboard</Trans>
      </Typography.H3>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
        <ExpandableCard
          title={t('Total Super Participants')}
          total={totalUsersCount}
          items={usersList}
          color="#3b82f6"
          icon={<PersonIcon className="size-6 text-white" />}
        />
        <ExpandableCard
          title={t('Total Venues')}
          total={totalVenuesCount}
          items={venuesList}
          color="#10b981"
          icon={<HomeIcon className="size-6 text-white" />}
        />
      </div>

      <ExpandableCard
        title={t('Super Participants per Venue')}
        total={formattedUsersPerVenueData.length}
        items={formattedUsersPerVenueData}
        color="#e61c1cff"
        icon={<PersonIcon className="size-6 text-white" />}
      />

      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <Typography.H4 className="mb-4">
          <Trans>Super Participants created over time</Trans>
        </Typography.H4>
        <MetricLineChart
          data={formattedUsersOverTimeData}
          yAxisLabel={t('Super Participants')}
          xAxisLabel={t('Date')}
        />
      </div>

      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <Typography.H4 className="mb-4">
          <Trans>Venues created over time</Trans>
        </Typography.H4>
        <MetricLineChart
          data={formattedVenuesOverTimeData}
          yAxisLabel={t('Venues')}
          xAxisLabel={t('Date')}
        />
      </div>
    </div>
  );
};
