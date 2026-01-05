import { useTheme } from 'next-themes';
import React from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type MetricLineChartProps = {
  data: {
    date: string;
    counts: number;
  }[];
  xAxisLabel: string;
  yAxisLabel: string;
};

export const MetricLineChart: React.FC<MetricLineChartProps> = ({
  data,
  xAxisLabel,
  yAxisLabel,
}) => {
  const { theme } = useTheme();

  const tooltipStyle = {
    backgroundColor: theme === 'dark' ? '#000' : '#fff',
    color: theme === 'dark' ? '#fff' : '#000',
  };
  const dataMax = Math.max(...(data.map((item) => item.counts) || [0]));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" name={xAxisLabel} />
        <YAxis
          domain={[0, 'dataMax + 1']}
          allowDecimals={false}
          tickCount={Math.min(11, dataMax + 2)}
        />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend />
        <Line type="monotone" dataKey="counts" name={yAxisLabel} />
      </LineChart>
    </ResponsiveContainer>
  );
};
