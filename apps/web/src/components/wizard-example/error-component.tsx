import { Trans } from 'next-i18next';
import type { FC } from 'react';

import { Button } from '@/theme/index';

type ErrorComponentProps = {
  name: string;
  errorMessage?: string;
  onTryAgain: () => void;
};

const ErrorComponent: FC<ErrorComponentProps> = ({
  name,
  errorMessage,
  onTryAgain,
}) => {
  return (
    <div>
      <h2 className="text-2xl font-bold">
        <Trans>Error</Trans>!
      </h2>
      <p className="mt-4">
        <Trans>An error has ocurred while creating workspace</Trans> &quot;
        {name}&quot;
      </p>
      <p className="mt-4">{errorMessage}</p>
      <p className="mt-4">
        <Trans>Please try again</Trans>
      </p>
      <Button className="mt-4" onClick={onTryAgain}>
        <Trans>Return to wizard</Trans>
      </Button>
    </div>
  );
};

export { ErrorComponent };
