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
} from '@/theme/index';
import { FileInput } from '@/ui/file-upload';
import type { FieldData } from '@/ui/form-hook-helper/types';

export type FileInputHelperProps<TFieldValues extends FieldValues> = {
  form: UseFormReturn<TFieldValues>;
  fieldData: FieldData<TFieldValues>;
  className?: string;
  multiple?: boolean;
  enableCrop?: boolean;
  cropAspectRatio?: number;
};

export const FileInputHelper = <TFieldValues extends FieldValues>({
  form,
  fieldData,
  className,
  multiple = false,
  enableCrop = false,
  cropAspectRatio = 1,
}: FileInputHelperProps<TFieldValues>): React.ReactNode => {
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
          <FileInput
            control={FormControl}
            onChange={(files): void => {
              if (multiple) {
                field.onChange(files);
              } else {
                field.onChange(files[0] || null);
              }
            }}
            value={field.value || []}
            multiple={multiple}
            enableCrop={enableCrop}
            cropAspectRatio={cropAspectRatio}
          />
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
