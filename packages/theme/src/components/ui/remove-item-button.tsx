import { TrashIcon } from '@radix-ui/react-icons';
import { Trans } from 'next-i18next';
import type { ReactNode } from 'react';
import { useState } from 'react';

import { Button } from './button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';

type RemoveItemButtonProps = {
  onConfirmDelete: () => Promise<void> | void;
  loading: boolean;
  label?: string;
  children?: ReactNode;
};

export const RemoveItemButton: React.FC<RemoveItemButtonProps> = ({
  onConfirmDelete,
  label = 'this item',
  loading,
  children,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenDialog = () => setIsDialogOpen(true);
  const handleCancel = () => setIsDialogOpen(false);
  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await onConfirmDelete();
    } finally {
      setIsDialogOpen(false);
      setIsDeleting(false);
    }
  };

  const isProcessing = loading || isDeleting;

  return (
    <>
      <Button
        variant="destructive"
        onClick={handleOpenDialog}
        disabled={isProcessing}
      >
        <TrashIcon className="size-4" />
        {children && <span className="ml-2">{children}</span>}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">
              <Trans>Confirm Deletion</Trans>
            </DialogTitle>
          </DialogHeader>

          <div className="py-4 text-center">
            <p className="text-muted-foreground">
              <Trans>
                Are you sure you want to delete {label}? This action cannot be
                undone.
              </Trans>
            </p>
          </div>

          <DialogFooter>
            <div className="flex w-full justify-center gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isProcessing}
              >
                <Trans>Cancel</Trans>
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Trans>Deleting...</Trans>
                ) : (
                  <Trans>Delete</Trans>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
