import { formatZodiosError, useDeleteUser } from '@meltstudio/client-common';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  useToast,
} from '@meltstudio/theme';
import { Trans } from 'next-i18next';
import type { FC } from 'react';

import { useSessionUser } from '@/components/user/user-context';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccessfulDelete: () => void;
  member: {
    id: string;
    name: string;
    email: string;
  };
};

export const DeleteMemberModal: FC<Props> = ({
  open,
  onOpenChange,
  member,
  onSuccessfulDelete,
}) => {
  const { selectedWorkspace } = useSessionUser();
  const { mutateAsync, isLoading } = useDeleteUser({
    params: { workspaceId: selectedWorkspace?.id ?? '' },
  });
  const { toast } = useToast();

  const handleDeleteUser = async (): Promise<void> => {
    try {
      await mutateAsync({ id: member.id });
      onSuccessfulDelete();
    } catch (error) {
      const e = error as Error;
      const message = formatZodiosError('deleteUser', e)?.error;
      toast({
        title: 'Error',
        description: message,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>
          <Trans>Delete User</Trans> ({member.name})
        </DialogTitle>
        <div className="flex flex-col gap-2">
          <p>
            <Trans>Are you sure you want to delete this user?</Trans>
          </p>
          <div>
            <ul>
              <li>
                ID: <b>{member.id}</b>
              </li>
              <li>
                <Trans>E-mail</Trans>: <b>{member.email}</b>
              </li>
            </ul>
          </div>
          <div className="mt-3 flex justify-end">
            <Button
              variant="ghost"
              onClick={(): void => onOpenChange(false)}
              disabled={isLoading}
            >
              <Trans>Cancel</Trans>
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              loading={isLoading}
            >
              <Trans>Delete</Trans>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
