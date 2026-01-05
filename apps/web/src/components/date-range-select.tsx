import { useTranslation } from 'next-i18next';
import type { FC } from 'react';

type Option = { value: string; label: string };

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export const DateRangeSelect: FC<Props> = ({ value, onChange }) => {
  const { t } = useTranslation();

  const options: Option[] = [
    { value: 'today', label: t('Today') },
    { value: '7days', label: t('7 Days') },
    { value: '3Months', label: t('3 Months') },
    { value: '6Months', label: t('6 Months') },
    { value: 'year', label: t('1 Year') },
  ];

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded border p-2"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};
