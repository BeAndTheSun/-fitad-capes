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

type NumberInputHelperProps<TFieldValues extends FieldValues> = {
  form: UseFormReturn<TFieldValues>;
  fieldData: FieldData<TFieldValues>;
  className?: string;
};

const INPUT_MAX_LENGTH = 15;

export const NumberInputHelper = <TFieldValues extends FieldValues>({
  form,
  fieldData,
  className,
}: NumberInputHelperProps<TFieldValues>): React.ReactNode => {
  return (
    <FormField
      control={form.control}
      name={fieldData.name}
      key={fieldData.name}
      render={({ field: { onChange, ...field } }): ReactElement => (
        <FormItem className={cn('col-span-12', className)}>
          <FormLabel>
            {fieldData.label} {fieldData.required && ' *'}
          </FormLabel>
          <FormControl>
            <Input
              {...field}
              // Adding a maxLength to avoid exceeding Number.MAX_SAFE_INTEGER
              maxLength={INPUT_MAX_LENGTH}
              type="text"
              inputMode="numeric"
              onBeforeInput={(e: React.ChangeEvent<HTMLInputElement>): void => {
                const currentValue = e.target.value;
                const selectionStart = e.target.selectionStart as number;
                const selectionEnd = e.target.selectionEnd as number;

                const newData = (e as unknown as { data: string }).data;
                // the new input value if the event is not prevented
                const expectedResult =
                  currentValue.slice(0, selectionStart) +
                  newData +
                  currentValue.slice(selectionEnd);

                // Check that only valid symbols (numbers, decimal dot, minus symbol and spaces) are inserted.
                // Spaces are removed in a later step
                if (!/^[0-9\-. ]+$/.test(newData)) {
                  e.preventDefault();
                  return;
                }

                // Ensure there is no more than one minus symbol and no more than one decimal dot
                const minusCount = expectedResult.replace(/[^-]/g, '').length;
                const dotCount = expectedResult.replace(/[^.]/g, '').length;
                if (minusCount > 1 || dotCount > 1) {
                  e.preventDefault();
                  return;
                }

                // ensure that, if there is a minus symbol, it will appear at the start
                if (
                  expectedResult.includes('-') &&
                  expectedResult.trim().at(0) !== '-'
                ) {
                  e.preventDefault();
                  return;
                }

                // Remove any spaces from the new value, but this will be done by preventing default behaviour
                // and manually changing the input value
                if (/.*\s+.*$/.test(newData)) {
                  e.preventDefault();
                  let newTrimmedData = newData.replace(/\s+/g, '');
                  // If the new value exceeds the length limit, this won't be catched by the maxLength property
                  // due to the event preventDefault. So we need to do it by ourselves
                  if (
                    currentValue.length + newTrimmedData.length >
                    INPUT_MAX_LENGTH
                  ) {
                    newTrimmedData = newTrimmedData.slice(
                      0,
                      INPUT_MAX_LENGTH - currentValue.length
                    );
                  }
                  // Set the new trimmed value
                  const newValue =
                    currentValue.slice(0, selectionStart) +
                    newTrimmedData +
                    currentValue.slice(selectionEnd);
                  e.target.value = newValue;

                  // Set the correct cursor location, as this can be affected by having the value manually modified
                  const newCursorPosition =
                    selectionStart + newTrimmedData.length;
                  e.target.selectionStart = newCursorPosition;
                  e.target.selectionEnd = newCursorPosition;

                  // we need to call `onChange` here as `preventDefault` has been called
                  onChange(newValue);
                }
              }}
              onChange={(e): void => {
                const newValue = e.target.value;
                onChange(newValue);
              }}
              placeholder={fieldData.placeholder}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
