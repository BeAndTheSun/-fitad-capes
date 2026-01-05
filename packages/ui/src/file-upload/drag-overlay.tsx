import { DownloadIcon } from '@radix-ui/react-icons';
import { Trans } from 'next-i18next';
import React from 'react';

import { cn } from '@/theme/utils';

export type FileDragOverlayProps = {
  isDragReject: boolean;
};

export const FileDragOverlay: React.FC<FileDragOverlayProps> = ({
  isDragReject,
}) => {
  return (
    <span
      className={cn(
        'absolute inset-0 flex items-center justify-center gap-1 border-2 border-dashed border-black bg-accent',
        { 'border-destructive text-destructive': isDragReject }
      )}
    >
      {isDragReject ? (
        'Invalid files detected'
      ) : (
        <>
          <DownloadIcon className="inline" />
          <Trans>Drop here</Trans>
        </>
      )}
    </span>
  );
};
