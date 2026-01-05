import { Dialog, DialogContent, DialogTitle } from '@meltstudio/theme';
import { Trans } from 'next-i18next';
import React from 'react';

import type { UserWorkspacePropsForUpdateRole } from './content';
import { UpdateUserWorkspaceRoleDialogContent } from './content';

export type UpdateRoleDialogProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  workspaces?: UserWorkspacePropsForUpdateRole;
  onClose?: () => void;
};

export const UpdateRoleDialog: React.FC<UpdateRoleDialogProps> = ({
  open,
  onOpenChange,
  workspaces,
  onClose,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>
          <Trans>Update Role for</Trans> {workspaces?.userId}
        </DialogTitle>
        <UpdateUserWorkspaceRoleDialogContent
          userWorkspace={workspaces}
          onCloseDialog={(): void => {
            onOpenChange?.(false);
            onClose?.();
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
