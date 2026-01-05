import { Button } from '@meltstudio/theme';
import { Trans } from 'next-i18next';
import type { FC } from 'react';

type NoAccessProps = {
  signOut: () => void;
};

const NoAccess: FC<NoAccessProps> = ({ signOut }) => {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">
          <Trans>No workspace found</Trans>
        </h1>
        <p className="mt-2 text-gray-500">
          <Trans>
            You don&apos;t have access. Please contact the admin to request an
            invitation.
          </Trans>
        </p>
        <Button
          className="mt-4"
          onClick={(): void => {
            signOut();
          }}
        >
          <Trans>Sign out</Trans>
        </Button>
      </div>
    </div>
  );
};

export { NoAccess };
