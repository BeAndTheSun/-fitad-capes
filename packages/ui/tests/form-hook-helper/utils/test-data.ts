/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { z } from 'zod';

import { buildNumberZodSchema } from '@/ui/form-hook-helper';

export function getDefaultValidationMessages() {
  const nameErrorMessage = 'Name is required';
  const passwordErrorMessage = 'Password is required';
  const ageErrorMessage = 'Age is required';
  const birthdayErrorMessage = 'Birthday is required';
  const checkboxesErrorMessage = 'Checkboxes are required';
  const roleErrorMessage = 'Role is required';
  const avatarErrorMessage = 'Avatar is required';
  const multiselectErrorMessage = 'Workspaces are required';
  return {
    fText: {
      string: nameErrorMessage,
      min: nameErrorMessage,
    },
    fPassword: {
      string: passwordErrorMessage,
      min: passwordErrorMessage,
    },
    fNumber: {
      isNumber: ageErrorMessage,
    },
    fDate: {
      date: birthdayErrorMessage,
    },
    fCheckbox: {
      array: checkboxesErrorMessage,
      min: checkboxesErrorMessage,
    },
    fSelect: {
      enum: roleErrorMessage,
    },
    fFile: {
      file: avatarErrorMessage,
    },
    fMultiselect: {
      array: multiselectErrorMessage,
      min: multiselectErrorMessage,
    },
  };
}

export function getTestSchema() {
  const messages = getDefaultValidationMessages();
  return z.object({
    fText: z
      .string({ message: messages.fText.string })
      .min(1, messages.fText.min),
    fPassword: z
      .string({ message: messages.fPassword.string })
      .min(1, messages.fPassword.min),
    fNumber: buildNumberZodSchema({
      errorMessages: { isNumber: messages.fNumber.isNumber },
    }),
    fDate: z.date({ message: messages.fDate.date }),
    fCheckbox: z
      .array(z.enum(['small', 'medium', 'large']), {
        message: messages.fCheckbox.array,
      })
      .min(1, messages.fCheckbox.min),
    fSelect: z.enum(['admin', 'user'], {
      message: messages.fSelect.enum,
    }),
    fFile: z.instanceof(File, { message: messages.fFile.file }),
    fMultiselect: z
      .array(z.enum(['google', 'microsoft', 'apple', 'meta']), {
        message: messages.fMultiselect.array,
      })
      .min(1, messages.fMultiselect.min),
  });
}

export type OptionExpectedValue = {
  label: string;
  value: string;
  checked: boolean;
};

export function getTestValues() {
  return {
    fText: 'John Doe',
    fPassword: 'john@example.com',
    fNumber: '42',
    fDate: '2020-1-15',
    fCheckbox: [
      { label: 'Small', value: 'small', checked: true },
      { label: 'Medium', value: 'medium', checked: false },
      { label: 'Large', value: 'large', checked: true },
    ] as const,
    fFile: new File([''], 'test.png', { type: 'image/png' }),
    fSelect: { value: 'admin', label: /admin/i } as const,
    fMultiselect: [
      { label: 'Google', value: 'google', checked: true },
      { label: 'Microsoft', value: 'microsoft', checked: false },
      { label: 'Apple', value: 'apple', checked: true },
      { label: 'Meta', value: 'meta', checked: true },
    ] as const,
  };
}

export function getTestValues2() {
  return {
    fText: 'Mary Sue',
    fPassword: 'mary@example.com',
    fNumber: '73',
    fDate: '2022-4-22',
    fCheckbox: [
      { label: 'Small', value: 'small', checked: false },
      { label: 'Medium', value: 'medium', checked: true },
      { label: 'Large', value: 'large', checked: false },
    ] as const,
    fFile: new File([''], 'test-mary.jpg', { type: 'image/jpg' }),
    fSelect: { value: 'user', label: /user/i } as const,
    fMultiselect: [
      { label: 'Google', value: 'google', checked: false },
      { label: 'Microsoft', value: 'microsoft', checked: true },
      { label: 'Apple', value: 'apple', checked: true },
      { label: 'Meta', value: 'meta', checked: false },
    ] as const,
  };
}

export function getFieldLabels() {
  return {
    fText: 'Name',
    fPassword: 'Password',
    fNumber: 'Age',
    fDate: 'Birthday',
    fCheckbox: 'Checkboxes',
    fSelect: 'Role',
    fFile: 'Avatar',
    fMultiselect: 'Workspaces',
    fList: 'List of elements',
  };
}

export function getListComponentTexts() {
  return {
    add: /Add/i,
    remove: /Remove/i,
  };
}
