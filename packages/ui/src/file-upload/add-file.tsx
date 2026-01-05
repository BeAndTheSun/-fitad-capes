import { Button } from '@meltstudio/theme';
import { Trans } from 'next-i18next';
import React from 'react';

export type AddFileProps = {
  onClick: () => void;
};

export const AddFile: React.FC<AddFileProps> = ({ onClick }) => {
  return (
    <span>
      <Button
        variant="default"
        size="sm"
        className="h-8"
        type="button"
        onClick={onClick}
      >
        <Trans>Add a file</Trans>
      </Button>{' '}
      <Trans>or drag here</Trans>
    </span>
  );
};
