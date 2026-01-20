import { Trans } from 'next-i18next';
import type { ReactNode } from 'react';
import React from 'react';
import type {
  ArrayPath,
  FieldValues,
  Path,
  UseFormReturn,
} from 'react-hook-form';
import { useFieldArray } from 'react-hook-form';

import {
  Button,
  cn,
  FormFieldUncontrolled,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/theme/index';
import type { FieldData } from '@/ui/form-hook-helper/types';

import { CheckboxInputHelper } from './fields/checkbox';
import { DateInputHelper } from './fields/date';
import { FileInputHelper } from './fields/file';
import { MultiSelectInputHelper } from './fields/multiselect';
import { NumberInputHelper } from './fields/number';
import { SelectInputHelper } from './fields/select';
import { TextInputHelper } from './fields/text';
import { TextAreaHelper } from './fields/text-area';
import { getFieldListDefaultValues } from './get-field-default-value';

export type FieldResolverProps<TFieldValues extends FieldValues> = {
  form: UseFormReturn<TFieldValues>;
  fieldData: FieldData<TFieldValues>;
};

export const FieldResolver = <TFieldValues extends FieldValues>({
  form,
  fieldData,
}: FieldResolverProps<TFieldValues>): ReactNode => {
  const { type = 'text', size = 'full' } = fieldData;
  let sizeClassName = 'col-span-12';
  if (size === 'half') {
    sizeClassName = cn(sizeClassName, 'md:col-span-6');
  }
  if (type === 'text' || type === 'password' || type === 'color') {
    return (
      <TextInputHelper
        key={fieldData.name}
        form={form}
        fieldData={fieldData}
        className={sizeClassName}
      />
    );
  }
  if (type === 'textarea') {
    return (
      <TextAreaHelper
        key={fieldData.name}
        form={form}
        fieldData={fieldData}
        className={sizeClassName}
      />
    );
  }
  if (type === 'number') {
    return (
      <NumberInputHelper
        key={fieldData.name}
        form={form}
        fieldData={fieldData}
        className={sizeClassName}
      />
    );
  }
  if (type === 'select') {
    return (
      <SelectInputHelper
        key={fieldData.name}
        form={form}
        fieldData={fieldData}
        className={sizeClassName}
      />
    );
  }
  if (type === 'multiselect') {
    return (
      <MultiSelectInputHelper
        key={fieldData.name}
        form={form}
        fieldData={fieldData}
        className={sizeClassName}
      />
    );
  }
  if (type === 'checkbox') {
    return (
      <CheckboxInputHelper
        key={fieldData.name}
        form={form}
        fieldData={fieldData}
        className={sizeClassName}
      />
    );
  }
  if (type === 'date') {
    return (
      <DateInputHelper
        key={fieldData.name}
        form={form}
        fieldData={fieldData}
        className={sizeClassName}
      />
    );
  }
  if (type === 'file') {
    return (
      <FileInputHelper
        key={fieldData.name}
        form={form}
        fieldData={fieldData}
        className={sizeClassName}
        multiple={fieldData.multiple}
        enableCrop={fieldData.enableCrop}
      />
    );
  }
  if (type === 'array') {
    return (
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      <InputListHelper
        key={fieldData.name}
        form={form}
        fieldData={fieldData}
        className={sizeClassName}
      />
    );
  }
  throw new Error(`Unsupported field type: ${type as string}`);
};

// InputListHelper added in this same file to avoid circular dependencies
// TODO: find a way to divide FieldResolver and InputListHelper in two separate files
export type InputListHelperProps<TFieldValues extends FieldValues> = {
  form: UseFormReturn<TFieldValues>;
  fieldData: FieldData<TFieldValues>;
  className?: string;
};

export const InputListHelper = <TFieldValues extends FieldValues>({
  form,
  fieldData,
  className,
}: InputListHelperProps<TFieldValues>): React.ReactNode => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: fieldData.name as ArrayPath<TFieldValues>,
  });
  return (
    <fieldset className={cn('space-y-3', className)}>
      <FormFieldUncontrolled name={fieldData.name}>
        <FormItem className={cn('col-span-12', className)}>
          <div className="flex w-full items-center gap-4">
            <FormLabel>
              {fieldData.label} {fieldData.required && ' *'}
            </FormLabel>
            <Button
              type="button"
              onClick={(): void => {
                const object = getFieldListDefaultValues(
                  fieldData.children || []
                );
                // expected type is dependent of some specific types that cannot be easily inferred here
                // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
                append(object as any);
              }}
            >
              <Trans>Add</Trans>
            </Button>
          </div>
          <FormMessage />
          {fields.map((fieldItem, index) => (
            <div
              className="grid grid-cols-12 gap-3 rounded-md border p-2"
              key={fieldItem.id}
              data-testid="fields-group-item"
            >
              {fieldData.children?.map((child) => (
                <FieldResolver
                  key={`${fieldItem.id}.${child.name}`}
                  form={form}
                  fieldData={{
                    ...child,
                    name: `${fieldData.name}.${index}.${child.name}` as Path<TFieldValues>,
                  }}
                />
              )) || []}
              <div className="col-span-12">
                <Button
                  variant="destructive"
                  onClick={(): void => remove(index)}
                  type="button"
                >
                  <Trans>Remove</Trans>
                </Button>
              </div>
            </div>
          ))}
        </FormItem>
      </FormFieldUncontrolled>
    </fieldset>
  );
};
