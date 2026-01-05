import { useRouter } from 'next/router';
import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useState } from 'react';

const useSafePush = (): { safePush: (path: string) => void } => {
  const [onChanging, setOnChanging] = useState(false);
  const handleRouteChange: Dispatch<SetStateAction<boolean>> = () => {
    setOnChanging(false);
  };
  const router = useRouter();
  // safePush is used to avoid route pushing errors when users click multiple times or when the network is slow:  "Error: Abort fetching component for route"
  const safePush = (path: string): void => {
    if (onChanging) {
      return;
    }
    setOnChanging(true);
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    router.push(path);
  };

  useEffect(() => {
    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router, setOnChanging]);
  return { safePush };
};

export { useSafePush };
