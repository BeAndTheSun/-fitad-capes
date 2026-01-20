import { Typography } from '@meltstudio/ui';
import { HomeIcon } from '@radix-ui/react-icons';
import type { FC } from 'react';

type CardProps = {
  title: string;
  total: number;
};

export const CardStats: FC<CardProps> = ({ title, total }) => {
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

      <Typography.H3 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
        {total}
      </Typography.H3>
    </div>
  );
};
