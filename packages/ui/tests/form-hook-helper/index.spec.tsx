import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';
import { getDate, getMonth, getYear } from 'date-fns';
import React from 'react';

import type { FieldData } from '@/ui/form-hook-helper';
import { useFormHelper } from '@/ui/form-hook-helper';

import {
  getDefaultValidationMessages,
  getFieldLabels,
  getTestSchema,
  getTestValues,
} from './utils/test-data';
import { TestHelper } from './utils/test-helper';

type DatePickerProps = {
  onSelect: (date: Date) => void;
  selected: Date | null;
  [key: string]: unknown;
};

// Mock the FileInput component
jest.mock('@/theme/components/ui/date-picker', () => ({
  DatePicker: ({
    onSelect,
    selected,
    ...props
  }: DatePickerProps): React.ReactNode => (
    <input
      {...props}
      type="text"
      value={
        selected
          ? `${getYear(selected)}-${getMonth(selected) + 1}-${getDate(selected)}`
          : ''
      }
      onChange={(e): void => onSelect?.(new Date(e.target.value))}
    />
  ),
}));

const schema = getTestSchema();
const validationMessages = getDefaultValidationMessages();
const testValues = getTestValues();
const fieldLabels = getFieldLabels();

const onSubmit = jest.fn();

const fields: FieldData<(typeof schema)['_input']>[] = [
  { name: 'fText', label: fieldLabels.fText, type: 'text' },
  { name: 'fPassword', label: fieldLabels.fPassword, type: 'password' },
  { name: 'fNumber', label: fieldLabels.fNumber, type: 'number' },
  { name: 'fDate', label: fieldLabels.fDate, type: 'date' },
  {
    name: 'fCheckbox',
    label: fieldLabels.fCheckbox,
    type: 'checkbox',
    options: [
      { value: 'small', label: 'Small' },
      { value: 'medium', label: 'Medium' },
      { value: 'large', label: 'Large' },
    ],
  },
  {
    name: 'fSelect',
    label: fieldLabels.fSelect,
    type: 'select',
    options: [
      { value: 'admin', label: 'Admin' },
      { value: 'user', label: 'User' },
    ],
  },
  {
    name: 'fMultiselect',
    label: fieldLabels.fMultiselect,
    type: 'multiselect',
    options: [
      { value: 'google', label: 'Google' },
      { value: 'microsoft', label: 'Microsoft' },
      { value: 'apple', label: 'Apple' },
      { value: 'meta', label: 'Meta' },
    ],
  },
  { name: 'fFile', label: fieldLabels.fFile, type: 'file' },
];

type TestComponentProps = {
  defaultValues?: Partial<(typeof schema)['_input']>;
};
const TestComponent = ({
  defaultValues,
}: TestComponentProps): React.ReactNode => {
  const { formComponent } = useFormHelper(
    {
      schema,
      fields,
      onSubmit,
    },
    {
      defaultValues,
    }
  );
  return formComponent;
};

beforeEach(() => {
  jest.resetAllMocks();
  window.HTMLElement.prototype.hasPointerCapture = jest.fn();
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, global-require
  window.ResizeObserver = require('resize-observer-polyfill');
});

jest.useRealTimers();

describe('useFormHelper with FormHelper integration', () => {
  const labelRegex = (label: string): RegExp =>
    new RegExp(`^${label.replace(/\*/g, '').trim()}\\s*\\*?$`, 'i');
  it('renders form fields correctly', async () => {
    render(<TestComponent />);

    expect(
      await screen.findByLabelText(labelRegex(fieldLabels.fText))
    ).toBeInTheDocument();
    expect(
      await screen.findByLabelText(labelRegex(fieldLabels.fPassword))
    ).toBeInTheDocument();
    expect(
      await screen.findByLabelText(labelRegex(fieldLabels.fNumber))
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('group', {
        name: labelRegex(fieldLabels.fCheckbox),
      })
    ).toBeInTheDocument();
    expect(
      await screen.findByLabelText(labelRegex(fieldLabels.fDate))
    ).toBeInTheDocument();
    expect(
      await screen.findByLabelText(labelRegex(fieldLabels.fSelect))
    ).toBeInTheDocument();
    expect(
      await screen.findByLabelText(labelRegex(fieldLabels.fFile))
    ).toBeInTheDocument();
    expect(
      await screen.findByLabelText(labelRegex(fieldLabels.fMultiselect))
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('button', { name: /submit/i })
    ).toBeInTheDocument();
  });

  it('renders form fields with default values set', async () => {
    render(
      <TestComponent
        defaultValues={{
          fText: testValues.fText,
          fPassword: testValues.fPassword,
          fSelect: testValues.fSelect.value,
          fCheckbox: testValues.fCheckbox
            .filter((val) => val.checked)
            .map((val) => val.value),
          // not setting a File default value, as this isn't a common use case.
          // TODO: add some way for showing the user that a file has already been uploaded
          // avatar: testValues.file,
          fNumber: testValues.fNumber,
          fDate: new Date(testValues.fDate),
          fMultiselect: testValues.fMultiselect
            .filter((val) => val.checked)
            .map((val) => val.value),
        }}
      />
    );

    expect(
      await screen.findByLabelText(labelRegex(fieldLabels.fText))
    ).toHaveValue(testValues.fText);
    expect(
      await screen.findByLabelText(labelRegex(fieldLabels.fPassword))
    ).toHaveValue(testValues.fPassword);
    expect(
      await screen.findByLabelText(labelRegex(fieldLabels.fSelect))
    ).toHaveTextContent(testValues.fSelect.label);
    await TestHelper.testCheckboxesValues(testValues.fCheckbox);
    expect(
      await screen.findByLabelText(labelRegex(fieldLabels.fNumber))
    ).toHaveValue(testValues.fNumber);
    expect(
      await screen.findByLabelText(labelRegex(fieldLabels.fDate))
    ).toHaveValue(testValues.fDate);
    await TestHelper.testMultiselectValues(testValues.fMultiselect);
    // expect(await screen.findByLabelText(fieldLabels.fMultiselect)).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    render(<TestComponent />);

    await TestHelper.typeInTextField(
      testValues.fText,
      labelRegex(fieldLabels.fText)
    );
    await TestHelper.typeInPasswordField(
      testValues.fPassword,
      labelRegex(fieldLabels.fPassword)
    );
    await TestHelper.typeInNumberField(
      testValues.fNumber,
      labelRegex(fieldLabels.fNumber)
    );
    await TestHelper.typeInCheckboxesFields(
      testValues.fCheckbox,
      labelRegex(fieldLabels.fCheckbox)
    );
    await TestHelper.typeInDateField(
      testValues.fDate,
      labelRegex(fieldLabels.fDate)
    );
    await TestHelper.typeInSelectField(
      testValues.fSelect.label,
      labelRegex(fieldLabels.fSelect)
    );
    await TestHelper.typeInFileField(
      testValues.fFile,
      labelRegex(fieldLabels.fFile)
    );
    await TestHelper.typeInMultiselectField(
      testValues.fMultiselect,
      labelRegex(fieldLabels.fMultiselect)
    );
    await TestHelper.clickSubmitButton();

    expect(onSubmit).toHaveBeenCalledWith({
      fText: testValues.fText,
      fPassword: testValues.fPassword,
      fNumber: Number(testValues.fNumber),
      fCheckbox: testValues.fCheckbox
        .filter(({ checked }) => checked)
        .map(({ value }) => value),
      fDate: new Date(testValues.fDate),
      fFile: testValues.fFile,
      fSelect: testValues.fSelect.value,
      fMultiselect: testValues.fMultiselect
        .filter(({ checked }) => checked)
        .map(({ value }) => value),
    });
  }, 10000);

  it('shows validation errors for invalid data', async () => {
    render(<TestComponent />);
    await TestHelper.clickSubmitButton();

    expect(
      await screen.findByText(validationMessages.fText.min)
    ).toBeInTheDocument();
    expect(
      await screen.findByText(validationMessages.fPassword.min)
    ).toBeInTheDocument();
    expect(
      await screen.findByText(validationMessages.fNumber.isNumber)
    ).toBeInTheDocument();
    expect(
      await screen.findByText(validationMessages.fDate.date)
    ).toBeInTheDocument();
    expect(
      await screen.findByText(validationMessages.fCheckbox.min)
    ).toBeInTheDocument();
    expect(
      await screen.findByText(validationMessages.fSelect.enum)
    ).toBeInTheDocument();
    expect(
      await screen.findByText(validationMessages.fFile.file)
    ).toBeInTheDocument();
    expect(
      await screen.findByText(validationMessages.fMultiselect.min)
    ).toBeInTheDocument();
  });

  it('hides validation errors after setting valid data', async () => {
    render(<TestComponent />);
    await TestHelper.clickSubmitButton();

    expect(screen.getByText(validationMessages.fText.min)).toBeInTheDocument();
    expect(
      screen.getByText(validationMessages.fPassword.min)
    ).toBeInTheDocument();
    expect(
      screen.getByText(validationMessages.fNumber.isNumber)
    ).toBeInTheDocument();
    expect(screen.getByText(validationMessages.fDate.date)).toBeInTheDocument();
    expect(
      screen.getByText(validationMessages.fCheckbox.min)
    ).toBeInTheDocument();
    expect(
      screen.getByText(validationMessages.fSelect.enum)
    ).toBeInTheDocument();
    expect(screen.getByText(validationMessages.fFile.file)).toBeInTheDocument();
    expect(
      screen.getByText(validationMessages.fMultiselect.min)
    ).toBeInTheDocument();
    await TestHelper.typeInTextField(testValues.fText, fieldLabels.fText);
    await TestHelper.typeInPasswordField(
      testValues.fPassword,
      fieldLabels.fPassword
    );
    await TestHelper.typeInNumberField(testValues.fNumber, fieldLabels.fNumber);
    await TestHelper.typeInCheckboxesFields(
      testValues.fCheckbox,
      fieldLabels.fCheckbox
    );
    await TestHelper.typeInDateField(testValues.fDate, fieldLabels.fDate);
    await TestHelper.typeInSelectField(
      testValues.fSelect.label,
      fieldLabels.fSelect
    );
    await TestHelper.typeInFileField(testValues.fFile, fieldLabels.fFile);
    await TestHelper.typeInMultiselectField(
      testValues.fMultiselect,
      fieldLabels.fMultiselect
    );

    expect(
      screen.queryByText(validationMessages.fText.min)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(validationMessages.fPassword.min)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(validationMessages.fNumber.isNumber)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(validationMessages.fDate.date)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(validationMessages.fCheckbox.min)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(validationMessages.fSelect.enum)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(validationMessages.fFile.file)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(validationMessages.fMultiselect.min)
    ).not.toBeInTheDocument();
  });
});
