import '@testing-library/jest-dom';

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDate, getMonth, getYear } from 'date-fns';
import React from 'react';
import { z } from 'zod';

import type { FieldData } from '@/ui/form-hook-helper';
import { useFormHelper } from '@/ui/form-hook-helper';

import {
  getFieldLabels,
  getListComponentTexts,
  getTestSchema,
  getTestValues,
  getTestValues2,
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

const schema = z.object({ fList: z.array(getTestSchema()) });
const testValuesJohn = getTestValues();
const testValuesMary = getTestValues2();
const fieldLabels = getFieldLabels();
const listComponentTexts = getListComponentTexts();

const onSubmit = jest.fn();

const fields: FieldData<(typeof schema)['_input']>[] = [
  {
    name: 'fList',
    label: fieldLabels.fList,
    type: 'array',
    children: [
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
    ],
  },
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

describe('test list option for useFormHelper', () => {
  it('renders empty list correctly', async () => {
    render(<TestComponent />);
    expect(
      await screen.findByRole('button', { name: listComponentTexts.add })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: listComponentTexts.remove })
    ).not.toBeInTheDocument();
    expect(
      await screen.findByRole('button', { name: /submit/i })
    ).toBeInTheDocument();
  });

  it('renders form fields correctly after pressing the add button', async () => {
    render(<TestComponent />);

    const addButton = await screen.findByRole('button', {
      name: listComponentTexts.add,
    });
    await userEvent.click(addButton);
    expect(await screen.findByLabelText(fieldLabels.fText)).toBeInTheDocument();
    expect(
      await screen.findByLabelText(fieldLabels.fPassword)
    ).toBeInTheDocument();
    expect(
      await screen.findByLabelText(fieldLabels.fNumber)
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('group', { name: fieldLabels.fCheckbox })
    ).toBeInTheDocument();
    expect(await screen.findByLabelText(fieldLabels.fDate)).toBeInTheDocument();
    expect(
      await screen.findByLabelText(fieldLabels.fSelect)
    ).toBeInTheDocument();
    expect(await screen.findByLabelText(fieldLabels.fFile)).toBeInTheDocument();
    expect(
      await screen.findByLabelText(fieldLabels.fMultiselect)
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('button', { name: listComponentTexts.remove })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('button', { name: /submit/i })
    ).toBeInTheDocument();
  });

  it('renders form fields correctly after pressing the add button multiple times', async () => {
    render(<TestComponent />);

    const ITEMS_COUNT = 3;

    const addButton = await screen.findByRole('button', {
      name: listComponentTexts.add,
    });
    for (let i = 0; i < ITEMS_COUNT; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await userEvent.click(addButton);
    }
    expect(await screen.findAllByLabelText(fieldLabels.fText)).toHaveLength(
      ITEMS_COUNT
    );
    expect(await screen.findAllByLabelText(fieldLabels.fPassword)).toHaveLength(
      ITEMS_COUNT
    );
    expect(await screen.findAllByLabelText(fieldLabels.fNumber)).toHaveLength(
      ITEMS_COUNT
    );
    expect(
      await screen.findAllByRole('group', { name: fieldLabels.fCheckbox })
    ).toHaveLength(ITEMS_COUNT);
    expect(await screen.findAllByLabelText(fieldLabels.fDate)).toHaveLength(
      ITEMS_COUNT
    );
    expect(await screen.findAllByLabelText(fieldLabels.fSelect)).toHaveLength(
      ITEMS_COUNT
    );
    expect(await screen.findAllByLabelText(fieldLabels.fFile)).toHaveLength(
      ITEMS_COUNT
    );
    expect(
      await screen.findAllByLabelText(fieldLabels.fMultiselect)
    ).toHaveLength(ITEMS_COUNT);
    expect(
      await screen.findAllByRole('button', { name: listComponentTexts.remove })
    ).toHaveLength(ITEMS_COUNT);
    expect(
      await screen.findByRole('button', { name: /submit/i })
    ).toBeInTheDocument();
  });

  it('renders form fields with default values set', async () => {
    render(
      <TestComponent
        defaultValues={{
          fList: [
            {
              fText: testValuesJohn.fText,
              fPassword: testValuesJohn.fPassword,
              fSelect: testValuesJohn.fSelect.value,
              fCheckbox: testValuesJohn.fCheckbox
                .filter((val) => val.checked)
                .map((val) => val.value),
              fFile: testValuesJohn.fFile,
              fNumber: testValuesJohn.fNumber,
              fDate: new Date(testValuesJohn.fDate),
              fMultiselect: testValuesJohn.fMultiselect
                .filter((val) => val.checked)
                .map((val) => val.value),
            },
            {
              fText: testValuesMary.fText,
              fPassword: testValuesMary.fPassword,
              fSelect: testValuesMary.fSelect.value,
              fCheckbox: testValuesMary.fCheckbox
                .filter((val) => val.checked)
                .map((val) => val.value),
              fFile: testValuesMary.fFile,
              fNumber: testValuesMary.fNumber,
              fDate: new Date(testValuesMary.fDate),
              fMultiselect: testValuesMary.fMultiselect
                .filter((val) => val.checked)
                .map((val) => val.value),
            },
          ],
        }}
      />
    );
    const fieldsGroups = await screen.findAllByTestId('fields-group-item');
    const firstGroup = within(fieldsGroups[0]!);
    const secondGroup = within(fieldsGroups[1]!);

    // --- tests for first group of fields ---
    expect(await firstGroup.findByLabelText(fieldLabels.fText)).toHaveValue(
      testValuesJohn.fText
    );
    expect(await firstGroup.findByLabelText(fieldLabels.fPassword)).toHaveValue(
      testValuesJohn.fPassword
    );
    expect(
      await firstGroup.findByLabelText(fieldLabels.fSelect)
    ).toHaveTextContent(testValuesJohn.fSelect.label);
    await TestHelper.testCheckboxesValues(testValuesJohn.fCheckbox, firstGroup);
    expect(await firstGroup.findByLabelText(fieldLabels.fNumber)).toHaveValue(
      testValuesJohn.fNumber
    );
    expect(await firstGroup.findByLabelText(fieldLabels.fDate)).toHaveValue(
      testValuesJohn.fDate
    );
    await TestHelper.testMultiselectValues(
      testValuesJohn.fMultiselect,
      firstGroup
    );

    // --- tests for second group of fields ---
    expect(await secondGroup.findByLabelText(fieldLabels.fText)).toHaveValue(
      testValuesMary.fText
    );
    expect(
      await secondGroup.findByLabelText(fieldLabels.fPassword)
    ).toHaveValue(testValuesMary.fPassword);
    expect(
      await secondGroup.findByLabelText(fieldLabels.fSelect)
    ).toHaveTextContent(testValuesMary.fSelect.label);
    await TestHelper.testCheckboxesValues(
      testValuesMary.fCheckbox,
      secondGroup
    );
    expect(await secondGroup.findByLabelText(fieldLabels.fNumber)).toHaveValue(
      testValuesMary.fNumber
    );
    expect(await secondGroup.findByLabelText(fieldLabels.fDate)).toHaveValue(
      testValuesMary.fDate
    );
    await TestHelper.testMultiselectValues(
      testValuesMary.fMultiselect,
      secondGroup
    );
  });

  it('submits form with valid data', async () => {
    render(<TestComponent />);

    // --- click add button twice ---
    const addButton = await screen.findByRole('button', {
      name: listComponentTexts.add,
    });
    await userEvent.click(addButton);
    await userEvent.click(addButton);

    // --- find input groups ---
    const fieldsGroups = await screen.findAllByTestId('fields-group-item');
    const firstGroup = within(fieldsGroups[0]!);
    const secondGroup = within(fieldsGroups[1]!);

    // --- type in first group ---
    await TestHelper.typeInTextField(
      testValuesJohn.fText,
      fieldLabels.fText,
      firstGroup
    );
    await TestHelper.typeInPasswordField(
      testValuesJohn.fPassword,
      fieldLabels.fPassword,
      firstGroup
    );
    await TestHelper.typeInNumberField(
      testValuesJohn.fNumber,
      fieldLabels.fNumber,
      firstGroup
    );
    await TestHelper.typeInCheckboxesFields(
      testValuesJohn.fCheckbox,
      fieldLabels.fCheckbox,
      firstGroup
    );
    await TestHelper.typeInDateField(
      testValuesJohn.fDate,
      fieldLabels.fDate,
      firstGroup
    );
    await TestHelper.typeInSelectField(
      testValuesJohn.fSelect.label,
      fieldLabels.fSelect,
      firstGroup
    );
    await TestHelper.typeInFileField(
      testValuesJohn.fFile,
      fieldLabels.fFile,
      firstGroup
    );
    await TestHelper.typeInMultiselectField(
      testValuesJohn.fMultiselect,
      fieldLabels.fMultiselect,
      firstGroup
    );

    // --- type in second group ---
    await TestHelper.typeInTextField(
      testValuesMary.fText,
      fieldLabels.fText,
      secondGroup
    );
    await TestHelper.typeInPasswordField(
      testValuesMary.fPassword,
      fieldLabels.fPassword,
      secondGroup
    );
    await TestHelper.typeInNumberField(
      testValuesMary.fNumber,
      fieldLabels.fNumber,
      secondGroup
    );
    await TestHelper.typeInCheckboxesFields(
      testValuesMary.fCheckbox,
      fieldLabels.fCheckbox,
      secondGroup
    );
    await TestHelper.typeInDateField(
      testValuesMary.fDate,
      fieldLabels.fDate,
      secondGroup
    );
    await TestHelper.typeInSelectField(
      testValuesMary.fSelect.label,
      fieldLabels.fSelect,
      secondGroup
    );
    await TestHelper.typeInFileField(
      testValuesMary.fFile,
      fieldLabels.fFile,
      secondGroup
    );
    await TestHelper.typeInMultiselectField(
      testValuesMary.fMultiselect,
      fieldLabels.fMultiselect,
      secondGroup
    );

    // --- submit data ---

    await TestHelper.clickSubmitButton();

    expect(onSubmit).toHaveBeenCalledWith({
      fList: [
        {
          fText: testValuesJohn.fText,
          fPassword: testValuesJohn.fPassword,
          fNumber: Number(testValuesJohn.fNumber),
          fCheckbox: testValuesJohn.fCheckbox
            .filter(({ checked }) => checked)
            .map(({ value }) => value),
          fDate: new Date(testValuesJohn.fDate),
          fFile: testValuesJohn.fFile,
          fSelect: testValuesJohn.fSelect.value,
          fMultiselect: testValuesJohn.fMultiselect
            .filter(({ checked }) => checked)
            .map(({ value }) => value),
        },
        {
          fText: testValuesMary.fText,
          fPassword: testValuesMary.fPassword,
          fNumber: Number(testValuesMary.fNumber),
          fCheckbox: testValuesMary.fCheckbox
            .filter(({ checked }) => checked)
            .map(({ value }) => value),
          fDate: new Date(testValuesMary.fDate),
          fFile: testValuesMary.fFile,
          fSelect: testValuesMary.fSelect.value,
          fMultiselect: testValuesMary.fMultiselect
            .filter(({ checked }) => checked)
            .map(({ value }) => value),
        },
      ],
    });
  }, 10000);
});
