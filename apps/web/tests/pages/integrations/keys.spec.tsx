import '@testing-library/jest-dom';

import {
  useListIntegrationKeys,
  useSaveIntegrationKeys,
} from '@meltstudio/client-common';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { IntegrationsKeys } from '@/common-types/site-integrations';
import { IntegrationSetupForm } from '@/components/integrations/setup-form';
import { useSessionUser } from '@/components/user/user-context';

// Mock the dependencies
jest.mock('@meltstudio/client-common');
jest.mock('@/components/user/user-context');
// jest.mock('@/theme/index');
jest.mock('next-i18next', () => ({
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  useTranslation: () => ({ t: (key: string): string => key }),
}));

beforeEach(() => {
  jest.resetAllMocks();
  window.HTMLElement.prototype.hasPointerCapture = jest.fn();
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, global-require
  window.ResizeObserver = require('resize-observer-polyfill');
});

describe('IntegrationSetupForm', () => {
  const mockOnCloseDialog = jest.fn();
  const mockInvalidate = jest.fn();

  const defaultProps = {
    platformId: IntegrationsKeys.Shopify,
    fields: [
      {
        label: 'API Key',
        name: 'apiKey',
        value: null,
        required: true,
      },
      {
        label: 'Secret Key',
        name: 'secretKey',
        value: null,
        required: true,
      },
    ],
    onCloseDialog: mockOnCloseDialog,
  };

  const mockWorkspace = {
    id: 'workspace-1',
    name: 'Test Workspace',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock useSessionUser
    (useSessionUser as jest.Mock).mockReturnValue({
      selectedWorkspace: mockWorkspace,
    });

    // Mock useListIntegrationKeys
    (useListIntegrationKeys as jest.Mock).mockReturnValue({
      data: {
        enabled: false,
        integrationKeys: [],
      },
      isLoading: false,
      invalidate: mockInvalidate,
    });

    // Mock useSaveIntegrationKeys
    (useSaveIntegrationKeys as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isLoading: false,
    });
  });

  it('pre-fills form with existing integration data', async () => {
    (useListIntegrationKeys as jest.Mock).mockReturnValue({
      data: {
        enabled: true,
        integrationKeys: [
          { keyName: 'apiKey', value: 'existing-api-key' },
          { keyName: 'secretKey', value: 'existing-secret-key' },
        ],
      },
      isLoading: false,
      invalidate: mockInvalidate,
    });

    render(<IntegrationSetupForm {...defaultProps} />);

    expect(await screen.findByLabelText(/enabled/i)).toBeChecked();
    expect(await screen.findByLabelText(/api key/i)).toHaveValue(
      'existing-api-key'
    );
    expect(await screen.findByLabelText(/secret key/i)).toHaveValue(
      'existing-secret-key'
    );
  });

  it('successfully submits form with valid data', async () => {
    const mockSaveIntegrationKeys = jest.fn();
    (useSaveIntegrationKeys as jest.Mock).mockReturnValue({
      mutate: mockSaveIntegrationKeys,
      isLoading: false,
    });

    render(<IntegrationSetupForm {...defaultProps} />);

    // Fill in the form
    await userEvent.click(await screen.findByLabelText(/enabled/i));

    const apiKeyInput = await screen.findByLabelText(/api key/i);
    await userEvent.clear(apiKeyInput);
    await userEvent.type(apiKeyInput, 'test-api-key');
    await userEvent.type(
      await screen.findByLabelText(/secret key/i),
      'test-secret-key'
    );

    // Submit the form
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(mockSaveIntegrationKeys).toHaveBeenCalledWith({
      enabled: true,
      keys: [
        { name: 'apiKey', value: 'test-api-key' },
        { name: 'secretKey', value: 'test-secret-key' },
      ],
    });
  });
});
