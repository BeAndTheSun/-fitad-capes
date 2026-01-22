import { getBaseUrl } from '@meltstudio/core';
import { Column, Container, Img, Section, Text } from '@react-email/components';

import { colors } from '@/mailing/theme';

export const Footer: React.FC = () => {
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
    <>
      <div
        style={{
          height: '1px',
          backgroundColor: colors.border,
          margin: '0 24px',
        }}
      />
      <Container style={{ backgroundColor: colors.background }}>
        <Section className="px-6 py-8">
          <Column align="center">
            <Img
              height={40}
              width={64}
              src={logoUrl}
              style={{
                display: 'block',
                margin: '0 auto 16px auto',
              }}
            />
            <Text
              className="m-0 text-center text-xs"
              style={{
                color: colors.muted,
                fontSize: '12px',
                lineHeight: '16px',
                textAlign: 'center',
                margin: '0',
              }}
            >
              © {new Date().getFullYear()} FIT ADS. All rights reserved.
            </Text>
          </Column>
        </Section>
      </Container>
    </>
  );
};
