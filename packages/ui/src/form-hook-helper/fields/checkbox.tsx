import React from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';

import {
  Checkbox,
  cn,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormLegend,
  FormMessage,
} from '@/theme/index';
import type { FieldData } from '@/ui/form-hook-helper/types';

export type CheckboxInputHelperProps<TFieldValues extends FieldValues> = {
  form: UseFormReturn<TFieldValues>;
  fieldData: FieldData<TFieldValues>;
  className?: string;
};

export const CheckboxInputListHelper = <TFieldValues extends FieldValues>({
  form,
  fieldData,
  className,
}: CheckboxInputHelperProps<TFieldValues>): React.ReactNode => {
  return (
    <FormField
      control={form.control}
      name={fieldData.name}
      render={(): React.ReactElement => (
        <fieldset className={cn('col-span-12', className)}>
          <FormLegend className="mb-2">
            {fieldData.label} {fieldData.required && ' *'}
          </FormLegend>
          {fieldData.options?.map((item) => (
            <FormField
              key={item.value}
              control={form.control}
              name={fieldData.name}
              render={({ field }): React.ReactElement => {
                return (
                  <FormItem
                    key={item.value}
                    className="mb-2 flex flex-row items-center space-x-3 space-y-0"
                  >
                    <FormControl>
                      <Checkbox
                        name={field.name}
                        value={item.value}
                        checked={
                          Array.isArray(field.value)
                            ? (field.value as string[])?.includes(item.value)
                            : false
                        }
                        onCheckedChange={(checked): void => {
                          if (Array.isArray(field.value)) {
                            const arrayOfValues = field.value as string[];
                            if (checked) {
                              return field.onChange([
                                ...arrayOfValues,
                                item.value,
                              ]);
                            }
                            return field.onChange(
                              arrayOfValues?.filter(
                                (value) => value !== item.value
                              )
                            );
                          }
                          if (checked) {
                            return field.onChange([item.value]);
                          }
                          return field.onChange([]);
                        }}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">
                      {item.label}
                    </FormLabel>
                  </FormItem>
                );
              }}
            />
          )) || []}
          <FormMessage />
        </fieldset>
      )}
    />
  );
};

export const CheckboxInputBooleanHelper = <TFieldValues extends FieldValues>({
  form,
  fieldData,
  className,
}: CheckboxInputHelperProps<TFieldValues>): React.ReactNode => {
  return (
    <FormField
      control={form.control}
      name={fieldData.name}
      render={({ field }): React.ReactElement => {
        return (
          <FormItem className={cn('col-span-12', className)}>
            <div className="flex flex-row items-center space-x-3">
              <FormControl>
                <Checkbox
                  name={field.name}
                  value="true"
                  checked={!!field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="w-full text-sm font-normal">
                {fieldData.label}
              </FormLabel>
            </div>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

export const CheckboxInputHelper = <TFieldValues extends FieldValues>({
  form,
  fieldData,
  className,
}: CheckboxInputHelperProps<TFieldValues>): React.ReactNode => {
  const checkboxMode = fieldData.checkboxMode || 'default';
  if (checkboxMode === 'default') {
    return (
      <CheckboxInputListHelper
        form={form}
        fieldData={fieldData}
        className={className}
      />
    );
  }
  if (checkboxMode === 'boolean') {
    return (
      <CheckboxInputBooleanHelper
        form={form}
        fieldData={fieldData}
        className={className}
      />
    );
  }
  throw new Error(`Invalid checkboxMode: ${checkboxMode as string}`);
};
