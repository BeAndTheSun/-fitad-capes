import type { ReactNode } from 'react';
import type { FieldValues, Path } from 'react-hook-form';

import type { DatePickerProps } from '@/theme/index';

export type FieldDataType =
  | 'text'
  | 'password'
  | 'number'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'date'
  | 'file'
  | 'array'
  | 'textarea';
export type FieldDataSize = 'half' | 'full';
export type FieldDataOption = {
  value: string;
  label: string;
  isDisabled?: boolean;
};

export type FieldCheckboxMode = 'default' | 'boolean';

export type FieldData<TFieldValues extends FieldValues = FieldValues> = {
  /** Field name (should match schema keys, supports dot notation as 'password.old' and 'password.new' for nested fields) */
  name: Path<TFieldValues>;
  /** Input label */
  label: ReactNode;
  /**
   * Used to specify the type of input to render.
   *  - For 'text' and 'password', prefer `z.string()` in the zod schema
   *  - For 'number', use `buildNumberZodSchema` in the zod schema
   *  - For 'date', use `z.date()` in the zod schema
   *  - For 'file', use `z.instanceof(File)` in the zod schema
   *  - For 'select', prefer `z.enum()` or `z.nativeEnum()` in the zod schema, but `z.string()` can also be used
   *  - For 'multiselect' and 'checkbox', prefer `z.array(z.enum())` or `z.array(z.nativeEnum(()))` in the zod schema
   *  - For 'array', set a zod schema `z.array(z.object())` and inside the `z.object` match the fields added in the `children` props
   */
  type?: FieldDataType;
  /** Field width as a portion of its container (default: 'full'). On mobile screens every field will always be full width */
  size?: FieldDataSize;
  /** Options for 'select' and 'checkbox' inputs */
  options?: FieldDataOption[];
  /** Props for date picker component (only for 'date' inputs) */
  dateInputProps?: DatePickerProps;
  /**
   * Used when `type` === 'checkbox'.
   * - If default, it will render the list of `options`, each one with its own label and checkbox
   * - If boolean, it will render only one boolean option with the `label` text
   */
  checkboxMode?: FieldCheckboxMode;
  /**
   * Used when `type` === 'array'
   * Specifies the children of every element of a list
   */
  children?: FieldData<FieldValues>[];
  multiple?: boolean;
  /** Used to specify that the field is required */
  dependsOn?: {
    field: keyof TFieldValues;
    value: string | number | boolean;
  };
  placeholder?: string;
  disablePastDates?: boolean;
  enableCrop?: boolean;
  required?: boolean;
};
