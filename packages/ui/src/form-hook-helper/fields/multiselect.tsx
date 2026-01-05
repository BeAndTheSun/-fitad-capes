import { useTranslation } from 'next-i18next';
import React from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';

import {
  cn,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/theme/index';
import type { FieldData } from '@/ui/form-hook-helper/types';
import { MultiSelect } from '@/ui/multiselect';

export type MultiSelectInputHelperProps<TFieldValues extends FieldValues> = {
  form: UseFormReturn<TFieldValues>;
  fieldData: FieldData<TFieldValues>;
  className?: string;
};

export const MultiSelectInputHelper = <TFieldValues extends FieldValues>({
  form,
  fieldData,
  className,
}: MultiSelectInputHelperProps<TFieldValues>): React.ReactNode => {
  const { t } = useTranslation();
  return (
    <FormField
      control={form.control}
      name={fieldData.name}
      key={fieldData.name}
      render={({ field: { ...field } }): React.ReactElement => (
        <FormItem className={cn('col-span-12', className)}>
          <FormLabel>
            {fieldData.label} {fieldData.required && ' *'}
          </FormLabel>
          <FormControl>
            <MultiSelect
              options={fieldData.options || []}
              onValueChange={field.onChange}
              value={field.value}
              placeholder={fieldData.placeholder || t('Select options')}
              variant="default"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
