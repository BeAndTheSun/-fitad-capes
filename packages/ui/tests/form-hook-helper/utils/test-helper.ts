/* eslint-disable testing-library/prefer-screen-queries */
/* eslint-disable jest/no-standalone-expect */
import '@testing-library/jest-dom';

import type { BoundFunctions, queries } from '@testing-library/react';
import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { OptionExpectedValue } from './test-data';

type Within = BoundFunctions<typeof queries>;

export class TestHelper {
  public static async typeInTextField(
    value: string,
    label: string | RegExp,
    container: Within = screen
  ): Promise<void> {
    await userEvent.type(await container.findByLabelText(label), value);
  }

  public static async typeInNumberField(
    value: string,
    label: string | RegExp,
    container: Within = screen
  ): Promise<void> {
    await userEvent.type(await container.findByLabelText(label), value);
  }

  public static async typeInCheckboxesFields(
    values: readonly OptionExpectedValue[],
    label: string | RegExp,
    container: Within = screen
  ): Promise<void> {
    const checkboxesGroup = within(
      await container.findByRole('group', {
        name: label,
      })
    );
    // eslint-disable-next-line no-restricted-syntax
    for (const value of values) {
      // eslint-disable-next-line no-await-in-loop
      const checkboxInput = await checkboxesGroup.findByLabelText(value.label);
      if (value.checked) {
        // eslint-disable-next-line no-await-in-loop
        await userEvent.click(checkboxInput);
      }
    }
  }

  public static async typeInPasswordField(
    value: string,
    label: string | RegExp,
    container: Within = screen
  ): Promise<void> {
    await userEvent.type(await container.findByLabelText(label), value);
  }

  public static async typeInSelectField(
    value: string | RegExp,
    label: string | RegExp,
    container: Within = screen
  ): Promise<void> {
    await userEvent.click(await container.findByLabelText(label));
    // using screen here as the combobox is appended to the body root, not to the select container
    await userEvent.click(await screen.findByRole('option', { name: value }));
  }

  public static async typeInMultiselectField(
    values: readonly OptionExpectedValue[],
    label: string | RegExp,
    container: Within = screen
  ): Promise<void> {
    // open the multiselect
    await userEvent.click(await container.findByLabelText(label));
    // eslint-disable-next-line no-restricted-syntax
    for (const value of values) {
      // using screen here as the combobox is appended to the body root, not to the select container
      // eslint-disable-next-line no-await-in-loop
      const option = await screen.findByRole('option', { name: value.label });
      if (value.checked) {
        // eslint-disable-next-line no-await-in-loop
        await userEvent.click(option);
      }
    }
    // close the multiselect
    await userEvent.click(await container.findByLabelText(label));
  }

  public static async typeInDateField(
    value: string,
    label: string | RegExp,
    container: Within = screen
  ): Promise<void> {
    fireEvent.change(await container.findByLabelText(label), {
      target: { value },
    });
  }

  public static async typeInFileField(
    value: File,
    label: string | RegExp,
    container: Within = screen
  ): Promise<void> {
    await userEvent.upload(await container.findByLabelText(label), value);
  }

  public static async clickSubmitButton(): Promise<void> {
    await userEvent.click(
      await screen.findByRole('button', { name: /submit/i })
    );
  }

  public static async testCheckboxesValues(
    values: readonly OptionExpectedValue[],
    container: Within = screen
  ): Promise<void> {
    const checkboxesGroup = within(
      await container.findByRole('group', {
        name: /Checkboxes/i,
      })
    );
    // eslint-disable-next-line no-restricted-syntax
    for (const value of values) {
      // eslint-disable-next-line no-await-in-loop
      const checkboxInput = await checkboxesGroup.findByLabelText(value.label);
      if (value.checked) {
        expect(checkboxInput).toBeChecked();
      } else {
        expect(checkboxInput).not.toBeChecked();
      }
    }
  }

  public static async testMultiselectValues(
    values: readonly OptionExpectedValue[],
    container: Within = screen
  ): Promise<void> {
    const multiselectGroup = within(
      await container.findByRole('group', {
        name: /selected values/i,
      })
    );
    // eslint-disable-next-line no-restricted-syntax
    for (const value of values) {
      const selectedButton = multiselectGroup.queryByText(value.label);
      if (value.checked) {
        expect(selectedButton).toBeInTheDocument();
      } else {
        expect(selectedButton).not.toBeInTheDocument();
      }
    }
  }
}
