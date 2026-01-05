import { Typography } from '@meltstudio/ui';
import React from 'react';

type CardProps = {
  title: string;
  value: number | string;
  color: string;
  icon: React.ReactNode;
};

export const Card: React.FC<CardProps> = ({ title, value, color, icon }) => (
  <div className="flex h-28 w-full items-center justify-between rounded-lg bg-gray-100 p-6 shadow dark:bg-gray-900 dark:text-white">
    <div className="flex flex-col">
      <Typography.H4 className="text-sm font-semibold text-gray-500 dark:text-gray-300">
        {title}
      </Typography.H4>
      <Typography.H2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
        {value}
      </Typography.H2>
    </div>
    <div
      className="shrink-0 rounded-full p-3"
      style={{ backgroundColor: color }}
    >
      {icon}
    </div>
  </div>
);
