import { getBaseUrl } from '@meltstudio/core';
import { Column, Container, Link, Section } from '@react-email/components';

import { colors } from '@/mailing/theme';

import { EmailText } from './text';

export const Header: React.FC = () => {
  const getLogoUrl = (): string => {
    if (process.env.NODE_ENV === 'development') {
      return '/static/logo.png';
    }

    const baseUrl = getBaseUrl();
    if (baseUrl === 'http://localhost:3000') {
      return 'https://starter-kit-demo-v2.vercel.app/logo.png';
    }

    return `${baseUrl}/logo.png`;
  };

  const logoUrl = getLogoUrl();

  return (
    <Container style={{ backgroundColor: colors.background }}>
      <Section className="px-6 py-8">
        <Column align="center">
          <EmailText className="text-center">
            <Link
              className="text-xl font-bold no-underline"
              href={getBaseUrl()}
              style={{
                color: colors.foreground,
                textDecoration: 'none',
              }}
            >
              <img
                height={68}
                width={109}
                src={logoUrl}
                alt="Logo"
                className="mx-auto"
                style={{
                  display: 'block',
                  margin: '0 auto',
                }}
              />
            </Link>
          </EmailText>
        </Column>
      </Section>
      <div
        style={{
          height: '1px',
          backgroundColor: colors.border,
          margin: '0 24px',
        }}
      />
    </Container>
  );
};
