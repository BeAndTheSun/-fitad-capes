import { Typography } from '@meltstudio/ui';
import { Trans } from 'next-i18next';
import React from 'react';
import {
  Cell,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

type PieChartProps = {
  data: { name: string; value: number; color?: string }[];
  total: number;
};

export const PieChart: React.FC<PieChartProps> = ({ data, total }) => {
  return (
    <div className="relative flex flex-col items-center">
      <div className="absolute left-1/2 top-[35%] -translate-x-1/2 -translate-y-1/2 text-center">
        <Typography.Paragraph>
          <Trans>Total</Trans>
        </Typography.Paragraph>
        <Typography.H2 className="font-bold">{total}</Typography.H2>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <RechartsPieChart>
          <Pie
            data={data.map((d) => ({
              ...d,
              name: d.name,
            }))}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={85}
            fill="#8884d8"
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell
                // eslint-disable-next-line react/no-array-index-key
                key={`cell-${index}`}
                fill={entry.color}
              />
            ))}
          </Pie>
          <Tooltip />
        </RechartsPieChart>
      </ResponsiveContainer>
      <div className="mt-4 flex w-full justify-around">
        {data.map((entry, index) => (
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={`label-${index}`}
            className="flex w-1/4 flex-col items-center text-center"
          >
            <div className="flex items-center space-x-1">
              <span
                className="inline-block size-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <div className="mr-1 text-sm leading-none text-gray-500">
                {entry.name}
              </div>
            </div>
            <Typography.Paragraph className=" text-lg font-bold leading-none">
              {entry.value}
            </Typography.Paragraph>
          </div>
        ))}
      </div>
    </div>
  );
};
