'use client';

import { CalendarIcon } from '@radix-ui/react-icons';
import { format, isBefore, isToday, startOfDay } from 'date-fns';
import * as React from 'react';
import type { DayPickerSingleProps } from 'react-day-picker';

import { Button } from '@/theme/components/ui/button';
import { Calendar } from '@/theme/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/theme/components/ui/popover';
import { cn } from '@/theme/utils';

export type DatePickerProps = {
  onGoToToday?: () => void;
  buttonclassname?: string; // Lowercase due dom error
  disablePastDates?: boolean;
} & Omit<DayPickerSingleProps, 'mode'>;

export const DatePicker: React.FC<DatePickerProps> = (props) => {
  const {
    selected,
    onSelect,
    onGoToToday,
    disablePastDates = false,
    buttonclassname,
    disabled,
  } = props;

  const isSelectedToday = selected != null && isToday(selected);
  const today = startOfDay(new Date());

  const disabledDays = disablePastDates
    ? (date: Date) => isBefore(startOfDay(date), today)
    : disabled;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'justify-start text-left font-normal',
            !selected && 'text-muted-foreground',
            buttonclassname
          )}
        >
          <CalendarIcon className="mr-2 size-4" />
          {selected ? format(selected, 'PPP') : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={onSelect}
          defaultMonth={selected}
          disabled={disabledDays}
          showOutsideDays={false}
          modifiers={{
            selected: selected ? [selected] : [],
            today: new Date(),
          }}
          {...props}
        />
        {onGoToToday != null && !isSelectedToday && (
          <div className="flex justify-end p-2">
            <Button onClick={onGoToToday}>Go to today</Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
