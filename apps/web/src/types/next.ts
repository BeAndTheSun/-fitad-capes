import type { NextPage } from 'next';
import type { AppProps } from 'next/app';
import type { Session } from 'next-auth';

// eslint-disable-next-line @typescript-eslint/ban-types
export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  Layout?: React.FC<React.PropsWithChildren>;
};

export type AppPropsWithLayout = AppProps<{ session: Session | null }> & {
  Component: NextPageWithLayout;
};
