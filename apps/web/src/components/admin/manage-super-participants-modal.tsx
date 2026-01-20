import { useCreateRecord, useGetRecords } from '@meltstudio/client-common';
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
  ScrollArea,
  useToast,
} from '@meltstudio/theme';
import { cn } from '@meltstudio/theme/src/utils';
import { UserRoleEnum } from '@meltstudio/types';
import type { UserAdminType } from '@meltstudio/zod-schemas';
import { CaretSortIcon, CheckIcon, Cross2Icon } from '@radix-ui/react-icons';
import { Trans, useTranslation } from 'next-i18next';
import type { FC } from 'react';
import { useMemo, useState } from 'react';

type ManageSuperParticipantsModalProps = {
  workspaceId: string;
  existingUserIds: string[];
  onSuccess?: () => void;
};

export const ManageSuperParticipantsModal: FC<
  ManageSuperParticipantsModalProps
> = ({ workspaceId, existingUserIds, onSuccess }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [openCombobox, setOpenCombobox] = useState(false);

  // Fetch all users
  const { data: allUsers } = useGetRecords<UserAdminType>({
    model: 'users',
    enabled: open,
    pagination: {
      pageSize: 0,
    },
  });

  // Filter out users already in the workspace
  const availableUsers = useMemo(() => {
    if (!allUsers) return [];
    const existingSet = new Set(existingUserIds);
    return allUsers.items.filter((u) => !existingSet.has(u.id));
  }, [allUsers, existingUserIds]);

  const selectedUsersList = useMemo(() => {
    if (!allUsers) return [];
    return allUsers.items.filter((u) => selectedUserIds.includes(u.id));
  }, [allUsers, selectedUserIds]);

  const toggleUserSelection = (userId: string): void => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const createRecord = useCreateRecord({
    params: { model: 'userWorkspaces' },
  });

  const handleSave = async (): Promise<void> => {
    if (selectedUserIds.length === 0) {
      setOpen(false);
      return;
    }

    try {
      await Promise.all(
        selectedUserIds.map((userId) =>
          createRecord.mutateAsync({
            data: {
              userId,
              workspaceId,
              role: UserRoleEnum.MEMBER,
            },
            relations: [],
          })
        )
      );

      toast({
        title: t('Users added to workspace'),
      });
      setSelectedUserIds([]);
      setOpen(false);
      onSuccess?.();
    } catch {
      toast({
        title: t('Error adding users to workspace'),
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Trans>Add Super Participant</Trans>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            <Trans>Add Super Participant</Trans>
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">
              <Trans>Add super participants to workspace</Trans>
            </span>
            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCombobox}
                  className="w-full justify-between"
                >
                  {selectedUserIds.length > 0
                    ? t('{{count}} users selected', {
                        count: selectedUserIds.length,
                      })
                    : t('Select participant')}
                  <CaretSortIcon className="ml-2 size-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                {availableUsers.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    <Trans>No users available to add.</Trans>
                  </div>
                ) : (
                  <Command>
                    {/* // turbo */}
                    <CommandInput
                      placeholder={t('Search users...')}
                      className="h-9"
                    />
                    <CommandEmpty>{t('No users found.')}</CommandEmpty>
                    <CommandGroup className="max-h-[200px] overflow-auto">
                      {availableUsers.map((user) => (
                        <CommandItem
                          key={user.id}
                          onSelect={() => toggleUserSelection(user.id)}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={cn(
                                'flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                                selectedUserIds.includes(user.id)
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

          {selectedUsersList.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                <Trans>Selected Users</Trans>
              </span>
              <ScrollArea className="h-[400px] rounded-md border p-2">
                <div className="flex flex-col gap-2">
                  {selectedUsersList.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between rounded-sm bg-muted/50 p-2 text-sm"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="size-8 p-0"
                        onClick={() => toggleUserSelection(user.id)}
                      >
                        <Cross2Icon className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              <Trans>Cancel</Trans>
            </Button>
            <Button onClick={handleSave} disabled={createRecord.isLoading}>
              {createRecord.isLoading ? (
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
