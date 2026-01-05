import { Button, cn } from '@meltstudio/theme';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons';
import { Trans } from 'next-i18next';
import type { FC } from 'react';
import { usePagination } from 'react-instantsearch';

export const Pagination: FC = () => {
  const {
    currentRefinement,
    nbPages,
    isFirstPage,
    isLastPage,
    refine: setPage,
  } = usePagination();

  const currentPage = currentRefinement + 1;

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < nbPages;

  const handleNextPage = (): void => {
    if (canGoNext) {
      setPage(currentRefinement + 1);
    }
  };

  const handlePreviousPage = (): void => {
    if (canGoPrevious) {
      setPage(currentRefinement - 1);
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col items-end px-2 space-y-2 md:flex-row md:space-y-0 md:items-center'
      )}
    >
      <div className="flex flex-col items-end space-y-2 md:flex-row md:space-x-6 md:space-y-0 lg:space-x-8">
        <div className="flex flex-row items-center">
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            <Trans>Page</Trans> {currentPage} <Trans>of</Trans> {nbPages}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden size-8 p-0 lg:flex"
              onClick={(): void => setPage(0)}
              disabled={isFirstPage}
            >
              <span className="sr-only">
                <Trans>Go to first page</Trans>
              </span>
              <DoubleArrowLeftIcon className="size-4" />
            </Button>

            <Button
              variant="outline"
              className="size-8 p-0"
              onClick={handlePreviousPage}
              disabled={!canGoPrevious}
            >
              <span className="sr-only">
                <Trans>Go to previous page</Trans>
              </span>
              <ChevronLeftIcon className="size-4" />
            </Button>

            <Button
              variant="outline"
              className="size-8 p-0"
              onClick={handleNextPage}
              disabled={!canGoNext}
            >
              <span className="sr-only">
                <Trans>Go to next page</Trans>
              </span>
              <ChevronRightIcon className="size-4" />
            </Button>

            <Button
              variant="outline"
              className="hidden size-8 p-0 lg:flex"
              onClick={(): void => setPage(nbPages)}
              disabled={isLastPage}
            >
              <span className="sr-only">
                <Trans>Go to last page</Trans>
              </span>
              <DoubleArrowRightIcon className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
