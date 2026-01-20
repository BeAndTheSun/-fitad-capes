import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';

export type UseTabsResult<T extends string> = {
  currentTab: T;
  setTab: (tab: T) => Promise<boolean>;
  isValidTab: (tab: string) => tab is T;
};

type UseTabsOptions<T extends string> = {
  /**
   * The list of valid tabs.
   */
  validTabs: readonly T[];
  /**
   * The default tab to use if the current tab is invalid or not present.
   */
  defaultTab: T;
  /**
   * The query parameter name to use for the tab.
   * @default 'tab'
   */
  paramName?: string;
  /**
   * Whether to scroll to the top of the page when changing tabs.
   * @default false
   */
  scroll?: boolean;
  /**
   * Whether to use shallow routing.
   * @default true
   */
  shallow?: boolean;
};

/**
 * Generic hook to manage tabs with URL sync.
 * Tab state is stored in URL query params.
 */
export function useTabs<T extends string>({
  validTabs,
  defaultTab,
  paramName = 'tab',
  scroll = false,
  shallow = true,
}: UseTabsOptions<T>): UseTabsResult<T> {
  const router = useRouter();

  const isValidTab = useCallback(
    (tab: string): tab is T => {
      return validTabs.includes(tab as T);
    },
    [validTabs]
  );

  const currentTab = useMemo((): T => {
    const tabParam = router.query[paramName];
    if (typeof tabParam === 'string' && isValidTab(tabParam)) {
      return tabParam;
    }
    return defaultTab;
  }, [router.query, paramName, isValidTab, defaultTab]);

  const setTab = useCallback(
    (tab: T): Promise<boolean> => {
      // Preserve existing query parameters
      const query = { ...router.query, [paramName]: tab };

      return router.push(
        {
          pathname: router.pathname,
          query,
        },
        undefined,
        { shallow, scroll }
      );
    },
    [router, paramName, shallow, scroll]
  );

  return {
    currentTab,
    setTab,
    isValidTab,
  };
}
