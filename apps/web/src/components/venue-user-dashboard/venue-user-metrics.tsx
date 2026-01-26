/* eslint-disable import/no-extraneous-dependencies */
import { useGetUserMetrics } from '@meltstudio/client-common';
import { Typography } from '@meltstudio/ui';
import { Activity, CheckCircle, Clock, XCircle } from 'lucide-react';

const statusConfig = {
  joined: {
    label: 'Joined',
    icon: Activity,
    bgColor: '#3b82f6', // blue-500
  },
  checking: {
    label: 'Checking In',
    icon: Clock,
    bgColor: '#eab308', // yellow-500
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle,
    bgColor: '#22c55e', // green-500
  },
  failed: {
    label: 'Failed',
    icon: XCircle,
    bgColor: '#ef4444', // red-500
  },
};

export const VenueUserMetrics = (): JSX.Element => {
  const { data: metrics, isLoading } = useGetUserMetrics();

  if (isLoading) {
    return <div>Loading metrics...</div>;
  }

  const counts =
    metrics?.reduce(
      (acc, curr) => ({
        ...acc,
        [curr.status]: curr.count,
      }),
      {} as Record<string, number>
    ) || {};

  const getStatusLabel = (status: string): string => {
    return statusConfig[status as keyof typeof statusConfig]?.label || status;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {(Object.keys(statusConfig) as (keyof typeof statusConfig)[]).map(
        (status) => {
          const config = statusConfig[status];
          const count = counts[status] || 0;
          const Icon = config.icon;

          return (
            <div
              key={status}
              className="rounded-xl bg-white p-6 shadow dark:bg-gray-800"
            >
              <div className="flex items-center justify-between">
                <Typography.Paragraph className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {config.label}
                </Typography.Paragraph>

                <div
                  className="rounded-full p-3 shadow-sm"
                  style={{ backgroundColor: config.bgColor }}
                >
                  <Icon className="size-6 text-white" />
                </div>
              </div>

              <Typography.H3 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {count}
              </Typography.H3>

              <p className="mt-2 text-xs text-muted-foreground">
                {getStatusLabel(status)}
              </p>
            </div>
          );
        }
      )}
    </div>
  );
};
