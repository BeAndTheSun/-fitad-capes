import {
  useCreateRecord,
  useGetModelRelations,
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
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  useToast,
} from '@meltstudio/theme';
import {
  USER_ROLE_LABELS,
  UserRoleEnum,
  userRoleList,
} from '@meltstudio/types';
import type { UserAdminType } from '@meltstudio/zod-schemas';
import { Trans, useTranslation } from 'next-i18next';
import type { FC } from 'react';
import { useMemo, useState } from 'react';

type ManageUserWorkspaceModalProps = {
  onSuccess?: () => void;
  preselectedWorkspaceId?: string;
  preselectedRole?: UserRoleEnum;
};

export const ManageUserWorkspaceModal: FC<ManageUserWorkspaceModalProps> = ({
  onSuccess,
  preselectedWorkspaceId,
  preselectedRole,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [userId, setUserId] = useState('');
  const [workspaceId, setWorkspaceId] = useState(preselectedWorkspaceId || '');
  const [role, setRole] = useState<UserRoleEnum>(
    preselectedRole || UserRoleEnum.MEMBER
  );

  // Fetch users with full data (including email)
  const { data: usersData } = useGetRecords<UserAdminType>({
    model: 'users',
    enabled: open,
    pagination: {
      pageSize: 0,
    },
  });

  // Create user options for the Combobox
  const userOptions = useMemo(() => {
    return (
      usersData?.items?.map((user) => ({
        label: `${user.name} (${user.email})`,
        value: user.id,
      })) || []
    );
  }, [usersData]);

  // Fetch workspaces for the select
  const relations = useGetModelRelations({
    model: 'userWorkspaces',
    relations: ['workspace'],
  });
  const workspaces = relations[0]?.data || [];

  // Fetch existing user-workspace assignments
  const { data: userWorkspaces } = useGetRecords({
    model: 'userWorkspaces',
    enabled: open,
  });

  // Check if user is already in the selected workspace
  const isUserInWorkspace = useMemo(() => {
    if (!userId || !workspaceId || !userWorkspaces) return false;
    return (
      userWorkspaces.items as Array<{ userId: string; workspaceId: string }>
    ).some((uw) => uw.userId === userId && uw.workspaceId === workspaceId);
  }, [userId, workspaceId, userWorkspaces]);

  const createRecord = useCreateRecord({
    params: { model: 'userWorkspaces' },
  });

  const handleSubmit = (): void => {
    if (!userId || !workspaceId) {
      toast({
        title: t('Please select a user and workspace'),
        variant: 'destructive',
      });
      return;
    }

    if (isUserInWorkspace) {
      toast({
        title: t('User is already in this workspace'),
        variant: 'destructive',
      });
      return;
    }

    createRecord.mutate(
      {
        data: {
          userId,
          workspaceId,
          role,
        },
        relations: [],
      },
      {
        onSuccess: () => {
          toast({
            title: t('User added to workspace'),
          });
          setOpen(false);
          setUserId('');
          setWorkspaceId('');
          setRole(UserRoleEnum.MEMBER);
          onSuccess?.();
        },
        onError: () => {
          toast({
            title: t('Error adding user to workspace'),
            variant: 'destructive',
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Trans>Manage User Workspace</Trans>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            <Trans>Manage User Workspace</Trans>
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label>
              <Trans>User</Trans>
            </Label>
            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCombobox}
                  className="w-full justify-between"
                >
                  {userId
                    ? userOptions.find((option) => option.value === userId)
                        ?.label
                    : t('Select a user')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput
                    placeholder={t('Search users...')}
                    className="h-9"
                  />
                  <CommandEmpty>{t('No users found.')}</CommandEmpty>
                  <CommandGroup className="max-h-[300px] overflow-auto">
                    {userOptions.map((option) => (
                      <CommandItem
                        key={option.value}
                        onSelect={() => {
                          setUserId(option.value);
                          setOpenCombobox(false);
                        }}
                      >
                        {option.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {!preselectedWorkspaceId && (
            <div className="flex flex-col gap-2">
              <Label>
                <Trans>Workspace</Trans>
              </Label>
              <Select value={workspaceId} onValueChange={setWorkspaceId}>
                <SelectTrigger>
                  <SelectValue placeholder={t('Select a workspace')} />
                </SelectTrigger>
                <SelectContent>
                  {workspaces.map((ws) => (
                    <SelectItem key={ws.id} value={ws.id}>
                      {ws.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {!preselectedRole && (
            <div className="flex flex-col gap-2">
              <Label>
                <Trans>Role</Trans>
              </Label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as UserRoleEnum)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('Select a role')} />
                </SelectTrigger>
                <SelectContent>
                  {userRoleList.map((roleOption) => (
                    <SelectItem key={roleOption} value={roleOption}>
                      {USER_ROLE_LABELS[roleOption]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <Button
            onClick={handleSubmit}
            disabled={createRecord.isLoading}
            className="mt-2"
          >
            {createRecord.isLoading ? (
              <Trans>Adding...</Trans>
            ) : (
              <Trans>Add to Workspace</Trans>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
