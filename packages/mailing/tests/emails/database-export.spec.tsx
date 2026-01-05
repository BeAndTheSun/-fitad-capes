import { render, screen } from '@testing-library/react';

import DatabaseExport from '@/mailing/emails/database-export';

describe('DatabaseExport Email Template', () => {
  const downloadLink = 'https://example.com/download';

  test('renders the header, footer, and main content', () => {
    render(<DatabaseExport downloadLink={downloadLink} />);

    expect(screen.getByText(/export complete/i)).toBeInTheDocument();

    expect(
      screen.getByText(/your database export has been successfully processed/i)
    ).toBeInTheDocument();

    const downloadButton = screen.getByRole('link', {
      name: /download export/i,
    });
    expect(downloadButton).toBeInTheDocument();
    expect(downloadButton).toHaveAttribute('href', downloadLink);
  });

  test('has the correct subject line', () => {
    expect(DatabaseExport.subject).toBe('Your database export is ready');
  });
});
