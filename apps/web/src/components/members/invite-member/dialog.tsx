import { Trans } from 'next-i18next';
import React from 'react';

import { Dialog, DialogContent, DialogTitle } from '@/theme/index';

import { InviteMemberDialogContent } from './content';

export type InviteMemberDialogProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const InviteMemberDialog: React.FC<InviteMemberDialogProps> = ({
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>
          <Trans>Invite new member</Trans>
        </DialogTitle>
        <InviteMemberDialogContent
          onCloseDialog={(): void => onOpenChange?.(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
