import { useFetchMetrics } from '@meltstudio/client-common/src/sdk';
import { useTranslation } from 'next-i18next';
import type { FC } from 'react';

import { useSessionUser } from '@/components/user/user-context';

import { CardStats } from './card-stats';

enum Metric {
  PARTICIPANTS_BY_STATUS_BY_OWNER = 'PARTICIPANTS_BY_STATUS_BY_OWNER',
}

export const VenueOwnerStats: FC = () => {
  const { t } = useTranslation();
  const { selectedWorkspace, user } = useSessionUser();

  const { data } = useFetchMetrics({
    metric: Metric.PARTICIPANTS_BY_STATUS_BY_OWNER,
    workspaceId: selectedWorkspace?.id ?? '',
    sessionUserId: user?.id ?? '',
  });

  const joinedCount = data?.find((item) => item.label === 'joined')?.count ?? 0;
  const checkingCount =
    data?.find((item) => item.label === 'checking')?.count ?? 0;
  const completedCount =
    data?.find((item) => item.label === 'completed')?.count ?? 0;
  const failedCount = data?.find((item) => item.label === 'failed')?.count ?? 0;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <CardStats title={t('Joined Participants')} total={joinedCount} />
      <CardStats title={t('Check-in in progress')} total={checkingCount} />
      <CardStats title={t('Completed Participants')} total={completedCount} />
      <CardStats title={t('Failed Participants')} total={failedCount} />
    </div>
  );
};
