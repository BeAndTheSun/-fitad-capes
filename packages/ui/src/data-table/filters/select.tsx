'use client';

import {
  Badge,
  Button,
  cn,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator,
} from '@meltstudio/theme';
import { CheckIcon, PlusCircledIcon } from '@radix-ui/react-icons';
import type { Table } from '@tanstack/react-table';
import { Trans } from 'next-i18next';

import type { DataTableSelectOption } from '@/ui/data-table/types';

import {
  getArrayFilterValue,
  setFilterValue,
  updateArrayFilterValue,
} from './helpers';

type DataTableSelectFilterOptionProps = {
  option: DataTableSelectOption;
  isSelected: boolean;
  onSelect: (value: string) => void;
};

const DataTableSelectFilterOption: React.FC<
  DataTableSelectFilterOptionProps
> = (props) => {
  const { option, isSelected, onSelect } = props;

  const handleSelect = (): void => {
    onSelect(option.value);
  };

  return (
    <CommandItem key={option.value} onSelect={handleSelect}>
      <div
        className={cn(
          'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
          isSelected
            ? 'bg-primary text-primary-foreground'
            : 'opacity-50 [&_svg]:invisible'
        )}
      >
        <CheckIcon className={cn('h-4 w-4')} />
      </div>
      <span>{option.label}</span>
    </CommandItem>
  );
};

type DataTableSelectFilterProps<TData> = {
  table: Table<TData>;
  isGlobal: boolean;
  id: string;
  title: string;
  allowMultiple?: boolean;
  options: DataTableSelectOption[];
};

export const DataTableSelectFilter = <TData,>(
  props: DataTableSelectFilterProps<TData>
): React.ReactNode => {
  const { table, isGlobal, id, title, allowMultiple = true, options } = props;

  const selectedValues = getArrayFilterValue(id, table, isGlobal);
  const selectedOptions = options.filter((option) =>
    selectedValues.has(option.value)
  );

  const handleOptionSelect = (value: string): void => {
    const filterValue = updateArrayFilterValue(
      selectedValues,
      value,
      allowMultiple
    );

    setFilterValue(
      id,
      filterValue.length ? filterValue : undefined,
      table,
      isGlobal
    );
  };

  const handleClearClick = (): void => {
    setFilterValue(id, undefined, table, isGlobal);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircledIcon className="mr-2 size-4" />
          {title}
          {selectedValues?.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedValues.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  selectedOptions.map((option) => (
                    <Badge
                      variant="secondary"
                      key={option.value}
                      className="rounded-sm px-1 font-normal"
                    >
                      {option.label}
                    </Badge>
                  ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>
              <Trans>No results found.</Trans>
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <DataTableSelectFilterOption
                  key={option.value}
                  option={option}
                  isSelected={selectedValues.has(option.value)}
                  onSelect={handleOptionSelect}
                />
              ))}
            </CommandGroup>

            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={handleClearClick}
                    className="justify-center text-center"
                  >
                    <Trans>Clear filters</Trans>
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
