import { Body, Font, Head, Html, Tailwind } from '@react-email/components';
import clsx from 'clsx';

import { themeDefaults } from '@/mailing/theme';

type BaseLayoutProps = {
  children: React.ReactNode;
  className?: string;
};

export const BaseLayout: React.FC<BaseLayoutProps> = (props) => {
  const { children, className } = props;

  return (
    <Tailwind>
      <Html>
        <Head>
          <Font
            fontFamily="neue-haas-unica"
            webFont={{
              url: 'https://use.typekit.net/qqd8jtb.css',
              format: 'woff2',
            }}
            fallbackFontFamily="Verdana"
          />
        </Head>

        <Body
          className={clsx('min-w-80 bg-gray-50', className)}
          style={{
            ...themeDefaults,
            backgroundColor: '#f8fafc',
          }}
        >
          <div className="mx-auto max-w-2xl px-4 py-8">
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
              {children}
            </div>
          </div>
        </Body>
      </Html>
    </Tailwind>
  );
};
