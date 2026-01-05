import { useState } from 'react';
import { useInstantSearch } from 'react-instantsearch';

type UseAlgoliaRefreshType = {
  refresh: () => Promise<void>;
  loading: boolean;
};

const TIMEOUT_DURATION = 800; // This is the approximate time it takes for Algolia to update complete update task

// NOTE: This hook is used to refresh the Algolia search index as they work async and indexes take a short time to update
export const useAlgoliaRefresh = (): UseAlgoliaRefreshType => {
  const { refresh } = useInstantSearch();
  const [loading, setLoading] = useState(false);

  const customRefresh = async (): Promise<void> => {
    setLoading(true);
    try {
      // NOTE: This is a workaround to wait for the Algolia index to update as the refresh is not instant after updates
      await new Promise((resolve) => {
        setTimeout(resolve, TIMEOUT_DURATION);
      });
      try {
        refresh();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        if (
          !errorMessage.includes(
            'The `start` method needs to be called before `refresh`'
          )
        ) {
          // eslint-disable-next-line no-console
          console.warn('Failed to refresh search:', error);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return { refresh: customRefresh, loading };
};
