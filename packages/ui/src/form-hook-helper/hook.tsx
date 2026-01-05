import { zodResolver } from '@hookform/resolvers/zod';
import type { ReactNode } from 'react';
import type { FieldValues, UseFormProps, UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

import { FormHelper } from './helper';
import type { FieldData } from './types';

export type UseFormHelperProps<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TSchema extends z.Schema<any, any>,
  TFieldValues extends TSchema['_input'] = TSchema['_input'],
> = {
  /** The form validation schema. */
  schema: TSchema;
  /** The list of field definitions. Fields will be rendered in the order specified by this list */
  fields: FieldData<TFieldValues>[];
  /** Show the submit button as loading and disabled */
  isLoading?: boolean;
  /** Content for the submit button. Defaults to text 'Submit' */
  submitContent?: React.ReactNode;
  /** Will be called on form submission. If `schema` has transformations, they will be applied. */
  onSubmit: (values: z.infer<TSchema>) => unknown;
  customSubmit?: boolean;
  error?: {
    error: string;
    code?: string | undefined;
    validationErrors?:
      | {
          message: string;
          fields: string[];
        }[]
      | undefined;
  } | null;
  customComponent?: ReactNode;
};

export type UseFormHelperReturn<TFieldValues extends FieldValues> = {
  /** JSX component that will show the form content */
  formComponent: React.ReactNode;
  /** useForm return value, can be used to manipulate the form value */
  form: UseFormReturn<TFieldValues>;
};

/**
 * Main hook to use as a wrapper over useForm
 */
export const useFormHelper = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TSchema extends z.Schema<any, any>,
  TFieldValues extends TSchema['_input'] = TSchema['_input'],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TContext = any,
>(
  props: UseFormHelperProps<TSchema, TFieldValues>,
  useFormProps: Omit<UseFormProps<TFieldValues, TContext>, 'resolver'>
): UseFormHelperReturn<TFieldValues> => {
  const form = useForm<TFieldValues>({
    resolver: zodResolver(props.schema),
    ...useFormProps,
  });

  const formComponent = (
    <FormHelper
      form={form}
      fields={props.fields}
      isLoading={props.isLoading || form.formState.isSubmitting}
      submitContent={props.submitContent}
      onSubmit={props.onSubmit}
      customSubmit={props.customSubmit}
      error={props.error}
      customComponent={props.customComponent}
    />
  );
  return { formComponent, form };
};
