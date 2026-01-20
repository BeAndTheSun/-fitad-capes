import {
  useCreateRecord,
  useDeleteRecord,
  useGetRecords,
} from '@meltstudio/client-common';
import {
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
  useToast,
} from '@meltstudio/theme';
import { cn } from '@meltstudio/theme/src/utils';
import { UserRoleEnum } from '@meltstudio/types';
import type { UserAdminType } from '@meltstudio/zod-schemas';
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons';
import { Trans, useTranslation } from 'next-i18next';
import type { FC } from 'react';
import { useMemo, useState } from 'react';

type ChangeTrainerModalProps = {
  workspaceId: string;
  existingUserIds: string[];
  currentTrainerId?: string; // The ID of the UserWorkspace record for the current trainer
  onSuccess?: () => void;
};

export const ChangeTrainerModal: FC<ChangeTrainerModalProps> = ({
  workspaceId,
  existingUserIds,
  currentTrainerId,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [openCombobox, setOpenCombobox] = useState(false);

  // Fetch all users
  const { data: allUsers } = useGetRecords<UserAdminType>({
    model: 'users',
    enabled: open,
    pagination: {
      pageSize: 100,
    },
  });

  // Filter out users already in the workspace
  const availableUsers = useMemo(() => {
    if (!allUsers) return [];
    const existingSet = new Set(existingUserIds);
    return allUsers.items.filter((u) => !existingSet.has(u.id));
  }, [allUsers, existingUserIds]);

  const selectedUser = useMemo(() => {
    if (!allUsers || !selectedUserId) return null;
    return allUsers.items.find((u) => u.id === selectedUserId);
  }, [allUsers, selectedUserId]);

  const createRecord = useCreateRecord({
    params: { model: 'userWorkspaces' },
  });

  const deleteOldTrainer = useDeleteRecord({
    model: 'userWorkspaces',
    id: currentTrainerId || '',
  });

  const handleSave = async (): Promise<void> => {
    if (!selectedUserId) {
      return;
    }

    try {
      // 1. Add new Trainer
      await createRecord.mutateAsync({
        data: {
          userId: selectedUserId,
          workspaceId,
          role: UserRoleEnum.ADMIN,
        },
        relations: [],
      });

      // 2. Remove old Trainer if exists
      if (currentTrainerId) {
        await deleteOldTrainer.mutateAsync(undefined);
      }

      toast({
        title: t('Trainer changed successfully'),
      });
      setSelectedUserId(null);
      setOpen(false);
      onSuccess?.();
    } catch {
      toast({
        title: t('Error changing trainer'),
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Trans>Change</Trans>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            <Trans>Change Trainer</Trans>
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">
              <Trans>
                Select a new trainer from users not in this workspace
              </Trans>
            </span>
            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCombobox}
                  className="w-full justify-between"
                >
                  {selectedUser ? selectedUser.name : t('Select user')}
                  <CaretSortIcon className="ml-2 size-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                {availableUsers.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    <Trans>No users available.</Trans>
                  </div>
                ) : (
                  <Command>
                    <CommandInput
                      placeholder={t('Search users...')}
                      className="h-9"
                    />
                    <CommandEmpty>{t('No users found.')}</CommandEmpty>
                    <CommandGroup className="max-h-[200px] overflow-auto">
                      {availableUsers.map((user) => (
                        <CommandItem
                          key={user.id}
                          onSelect={() => {
                            setSelectedUserId(user.id);
                            setOpenCombobox(false);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={cn(
                                'flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                                selectedUserId === user.id
                                  ? 'bg-primary text-primary-foreground'
                                  : 'opacity-50 [&_svg]:invisible'
                              )}
                            >
                              <CheckIcon className={cn('h-4 w-4')} />
                            </div>
                            <span>{user.name}</span>
                            <span className="ml-1 text-xs text-muted-foreground">
                              ({user.email})
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                )}
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              <Trans>Cancel</Trans>
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                createRecord.isLoading ||
                deleteOldTrainer.isLoading ||
                !selectedUserId
              }
            >
              {createRecord.isLoading || deleteOldTrainer.isLoading ? (
                <Trans>Saving...</Trans>
              ) : (
                <Trans>Save</Trans>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
