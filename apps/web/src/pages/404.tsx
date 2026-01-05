/* eslint-disable jsx-a11y/anchor-is-valid */
import Head from 'next/head';
import Link from 'next/link';
import { Trans } from 'next-i18next';
import React from 'react';

import { Button } from '@/theme/index';
import type { NextPageWithLayout } from '@/types/next';

const PageNotFound: NextPageWithLayout = () => (
  <div className="flex justify-center">
    <Head>
      <title>
        <Trans>Page not found</Trans>
      </title>
    </Head>
    <h1 className="px-6 text-4xl font-bold sm:text-5xl">404</h1>
    <div>
      <div className="border-l-2 px-6">
        <h2 className="mb-2 text-4xl font-bold sm:text-5xl">
          <Trans>Page not found</Trans>
        </h2>
        <p className="text-sm font-semibold text-gray-400 sm:text-base">
          <Trans>Please check the URL in the address bar and try again.</Trans>
        </p>
      </div>
      <Link href="/" passHref legacyBehavior>
        <a>
          <Button className="mt-9">
            <Trans>Go back home</Trans>
          </Button>
        </a>
      </Link>
    </div>
  </div>
);

type LayoutProps = {
  children?: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = (props) => {
  const { children } = props;

  return (
    <main className="flex h-screen items-center justify-center">
      {children}
    </main>
  );
};
PageNotFound.Layout = Layout;

export default PageNotFound;
