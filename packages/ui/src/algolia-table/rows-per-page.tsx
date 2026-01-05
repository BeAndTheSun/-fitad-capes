import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@meltstudio/theme';
import { Trans } from 'next-i18next';
import type { FC } from 'react';
import { useHitsPerPage } from 'react-instantsearch';

type PaginationOption = {
  label: string;
  value: number;
  isDefault?: boolean;
};

type Props = {
  items?: PaginationOption[];
};

const defaultPaginationOptions: PaginationOption[] = [
  { label: '10', value: 10, isDefault: true },
  { label: '20', value: 20 },
];

export const RowsPerPage: FC<Props> = ({ items }) => {
  const options = items || defaultPaginationOptions;

  const { refine: changeHitsPerPage, canRefine } = useHitsPerPage({
    items: options.map((o) => ({ ...o, default: o.isDefault })),
  });

  const handleSetHitsPerPage = (value: string): void => {
    const selectedHitsQty = Number.parseInt(value, 10);
    if (canRefine) changeHitsPerPage(selectedHitsQty);
  };

  return (
    <div className="flex items-center space-x-2">
      <p className="text-sm font-medium">
        <Trans>Rows per page</Trans>
      </p>
      <Select onValueChange={handleSetHitsPerPage}>
        <SelectTrigger className="h-8 w-[70px]">
          <SelectValue placeholder={options[0]?.label} />
        </SelectTrigger>
        <SelectContent side="top">
          {options.map(({ label, value }) => (
            <SelectItem key={label} value={value.toString()}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
