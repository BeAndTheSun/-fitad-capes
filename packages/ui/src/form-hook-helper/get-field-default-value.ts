import type { FieldValues } from 'react-hook-form';

import type { FieldData } from './types';

export type FieldDefaultValues = string | null | Date | [];

export function getFieldDefaultValue<
  TFieldValues extends FieldValues = FieldValues,
>(field: FieldData<TFieldValues>): FieldDefaultValues {
  switch (field.type) {
    case 'text':
    case 'number':
    case 'password':
      return '';
    case 'select':
    case 'file':
    case 'date':
      return null;
    case 'checkbox':
    case 'multiselect':
    case 'array':
      return [];
    default:
      throw new Error('Unsupported field type');
  }
}

export function getFieldListDefaultValues(
  fields: FieldData<FieldValues>[]
): Record<string, FieldDefaultValues> {
  return fields.reduce<Record<string, FieldDefaultValues>>(
    (acc, field) => ({
      ...acc,
      [field.name]: getFieldDefaultValue(field),
    }),
    {}
  );
}
