import type { ReactElement } from 'react';
import React from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';

import {
  cn,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@/theme/index';
import type { FieldData } from '@/ui/form-hook-helper/types';

export type TextInputHelperProps<TFieldValues extends FieldValues> = {
  form: UseFormReturn<TFieldValues>;
  fieldData: FieldData<TFieldValues>;
  className?: string;
};

export const TextInputHelper = <TFieldValues extends FieldValues>({
  form,
  fieldData,
  className,
}: TextInputHelperProps<TFieldValues>): React.ReactNode => {
  return (
    <FormField
      control={form.control}
      name={fieldData.name}
      key={fieldData.name}
      render={({ field }): ReactElement => (
        <FormItem className={cn('col-span-12', className)}>
          <FormLabel>
            {fieldData.label} {fieldData.required && ' *'}
          </FormLabel>
          <FormControl>
            <Input
              type={fieldData.type}
              {...field}
              placeholder={fieldData.placeholder}
              className={cn(
                fieldData.type === 'color'
                  ? 'h-10 max-w-[12rem] p-1'
                  : undefined
              )}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
