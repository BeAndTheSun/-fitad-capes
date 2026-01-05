import '@testing-library/jest-dom';

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MultiSelect } from '@/ui/multiselect';

const placeholderText = 'Select options';
const searchPlaceholder = 'Search...';
const searchTerm = 'ba';

const option1 = { value: 'apple', label: 'Apple' };
const option2 = { value: 'banana', label: 'Banana' };
const option3 = { value: 'bacon', label: 'Bacon' };
const option4 = { value: 'carrot', label: 'Carrot' };

const testOptions = [option1, option2, option3, option4];

describe('tests for multiselect component', () => {
  const onValueChangeMock = jest.fn();

  beforeEach(() => {
    onValueChangeMock.mockClear();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, global-require
    window.ResizeObserver = require('resize-observer-polyfill');
  });

  it('opens popover on click', async () => {
    render(
      <MultiSelect options={testOptions} onValueChange={onValueChangeMock} />
    );
    await userEvent.click(await screen.findByText(placeholderText));
    expect(await screen.findByRole('combobox')).toBeInTheDocument();
  });

  it('displays options and allows selection', async () => {
    render(
      <MultiSelect options={testOptions} onValueChange={onValueChangeMock} />
    );
    await userEvent.click(screen.getByText(placeholderText));
    await userEvent.click(screen.getByText(option1.label));
    expect(onValueChangeMock).toHaveBeenCalledWith([option1.value]);
  });

  it('allows multiple selections', async () => {
    render(
      <MultiSelect options={testOptions} onValueChange={onValueChangeMock} />
    );
    await userEvent.click(screen.getByText(placeholderText));
    await userEvent.click(screen.getByText(option1.label));
    await userEvent.click(screen.getByText(option2.label));
    await userEvent.click(screen.getByText(option4.label));
    expect(onValueChangeMock).toHaveBeenCalledWith([
      option1.value,
      option2.value,
      option4.value,
    ]);
  });

  describe('displays selected options and allows deselection', () => {
    it('from the combobox', async () => {
      render(
        <MultiSelect
          options={testOptions}
          onValueChange={onValueChangeMock}
          defaultValue={[option1.value, option3.value]}
        />
      );
      expect(screen.getByText(option1.label)).toBeInTheDocument();
      await userEvent.click(screen.getByText(placeholderText));
      const comboboxContent = within(
        await screen.findByRole('group', {
          name: /selected values/i,
        })
      );
      await userEvent.click(await comboboxContent.findByText(option1.label));
      expect(onValueChangeMock).toHaveBeenCalledWith([option3.value]);
    });

    it('from the outer button list', async () => {
      render(
        <MultiSelect
          options={testOptions}
          onValueChange={onValueChangeMock}
          defaultValue={[option1.value, option3.value]}
        />
      );
      expect(screen.getByText(option1.label)).toBeInTheDocument();
      await userEvent.click(screen.getByText(option1.label));
      expect(onValueChangeMock).toHaveBeenCalledWith([option3.value]);
    });
  });

  it('filters options based on search input', async () => {
    render(
      <MultiSelect options={testOptions} onValueChange={onValueChangeMock} />
    );
    await userEvent.click(screen.getByText(placeholderText));
    await userEvent.type(
      screen.getByPlaceholderText(searchPlaceholder),
      searchTerm
    );
    expect(await screen.findByText(option2.label)).toBeInTheDocument();
    expect(await screen.findByText(option3.label)).toBeInTheDocument();
    expect(screen.queryByText(option1.label)).not.toBeInTheDocument();
    expect(screen.queryByText(option4.label)).not.toBeInTheDocument();
  });

  it('allows clearing all selections', async () => {
    render(
      <MultiSelect
        options={testOptions}
        onValueChange={onValueChangeMock}
        defaultValue={[option1.value, option2.value]}
      />
    );
    expect(screen.getByText(option1.label)).toBeInTheDocument();
    expect(screen.getByText(option2.label)).toBeInTheDocument();
    await userEvent.click(screen.getByText('Clear all'));
    expect(onValueChangeMock).toHaveBeenCalledWith([]);
  });

  it('handles "Select All" functionality', async () => {
    render(
      <MultiSelect options={testOptions} onValueChange={onValueChangeMock} />
    );
    await userEvent.click(screen.getByText(placeholderText));
    await userEvent.click(screen.getByText('Select All'));
    expect(onValueChangeMock).toHaveBeenCalledWith([
      option1.value,
      option2.value,
      option3.value,
      option4.value,
    ]);
  });
});
