'use client';

import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons';
import { useState } from 'react';

import { cn } from '@/theme/utils';

import { Button } from './button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from './command';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

export type ComboboxOption = {
  label: string;
  value: string;
};

type ComboboxProps = {
  className?: string;
  placeholder?: string;
  inputPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  value?: string;
  options: ComboboxOption[];
  onSelect: (value?: string) => void;
};

export const Combobox: React.FC<ComboboxProps> = (props) => {
  const {
    className,
    placeholder,
    inputPlaceholder = 'Search',
    emptyMessage = 'No options found.',
    disabled,
    value,
    options,
    onSelect,
  } = props;

  const [open, setOpen] = useState(false);

  const selectedOption = options.find((option) => option.value === value);
  const handleItemSelect = (itemValue: string) => {
    onSelect(itemValue === value ? undefined : itemValue);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled} aria-disabled={disabled}>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          aria-disabled={disabled}
          className={cn('w-[200px] justify-between', className)}
        >
          {selectedOption?.label ?? placeholder}
          <CaretSortIcon className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder={inputPlaceholder} className="h-9" />
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          <CommandGroup>
            {options.map((option) => (
              <CommandItem
                key={option.value}
                onSelect={() => handleItemSelect(option.value)}
              >
                {option.label}
                <CheckIcon
                  className={cn(
                    'ml-auto h-4 w-4',
                    value === option.value ? 'opacity-100' : 'opacity-0'
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
