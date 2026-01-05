import { useFetchMetrics } from '@meltstudio/client-common/src/sdk';
import { Trans, useTranslation } from 'next-i18next';
import React from 'react';

import { useSessionUser } from '@/components/user/user-context';
import { Typography } from '@/ui/typography';
import { MetricLineChart } from '@/ui/utils';

type Metric = {
  date: string;
  count: number;
};

export const MetricsDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { selectedWorkspace } = useSessionUser();

  const {
    data: userData,
    error: userError,
    isLoading: isUserLoading,
  } = useFetchMetrics({
    metric: 'USERS_OVER_TIME',
    workspaceId: selectedWorkspace?.id ?? '',
  });

  if (isUserLoading) {
    return (
      <div>
        <Trans>Loading</Trans>...
      </div>
    );
  }

  if (userError) {
    return (
      <div>
        <Trans>Error loading data</Trans>.
      </div>
    );
  }

  const formattedUserData =
    userData?.map((item: Metric) => ({
      date: item.date,
      counts: item.count,
    })) ?? [];

  return (
    <div className="space-y-8">
      <Typography.Paragraph>
        <Trans>Users created over time in the workspace</Trans>
      </Typography.Paragraph>
      <MetricLineChart
        data={formattedUserData}
        yAxisLabel={t('users')}
        xAxisLabel={t('date')}
      />
    </div>
  );
};
