import React from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';

import {
  cn,
  DatePicker,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/theme/index';
import type { FieldData } from '@/ui/form-hook-helper/types';

export type DateInputHelperProps<TFieldValues extends FieldValues> = {
  form: UseFormReturn<TFieldValues>;
  fieldData: FieldData<TFieldValues>;
  className?: string;
};

export const DateInputHelper = <TFieldValues extends FieldValues>({
  form,
  fieldData,
  className,
}: DateInputHelperProps<TFieldValues>): React.ReactNode => {
  return (
    <FormField
      control={form.control}
      name={fieldData.name}
      key={fieldData.name}
      render={({ field: { onChange, value } }): React.ReactElement => (
        <FormItem className={cn('col-span-12', className)}>
          <FormLabel>
            {fieldData.label} {fieldData.required && ' *'}
          </FormLabel>
          <FormControl>
            <DatePicker
              selected={value}
              onSelect={(newValue): void => onChange(newValue || null)}
              buttonclassname="w-full"
              disablePastDates={fieldData.disablePastDates}
              {...fieldData.dateInputProps}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
