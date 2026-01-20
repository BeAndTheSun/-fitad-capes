/* eslint-disable import/no-extraneous-dependencies */
import { useCreateVenueUser, useGetRecords } from '@meltstudio/client-common';
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
  Textarea,
  useToast,
} from '@meltstudio/theme';
import type { UserAdminType } from '@meltstudio/zod-schemas';
import { UserPlus } from 'lucide-react';
import { Trans, useTranslation } from 'next-i18next';
import type { FC } from 'react';
import { useMemo, useState } from 'react';

import type { DbVenueUserWithRelations } from '@/db/schema';

type AddParticipantModalProps = {
  venueId: string;
  venueName: string;
  existingParticipants: DbVenueUserWithRelations[];
  onSuccess?: () => void;
};

export const AddParticipantModal: FC<AddParticipantModalProps> = ({
  venueId,
  venueName,
  existingParticipants,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [userId, setUserId] = useState('');
  const [comment, setComment] = useState('');

  // Fetch all workspace users
  const { data: usersData } = useGetRecords<UserAdminType>({
    model: 'users',
    enabled: open,
    pagination: {
      pageSize: 0,
    },
  });

  // Filter out users already in the venue
  const availableUsers = useMemo(() => {
    const existingUserIds = new Set(existingParticipants.map((p) => p.userId));
    return (
      usersData?.items?.filter((user) => !existingUserIds.has(user.id)) || []
    );
  }, [usersData, existingParticipants]);

  // Create user options for the Combobox
  const userOptions = useMemo(() => {
    return availableUsers.map((user) => ({
      label: `${user.name} (${user.email})`,
      value: user.id,
    }));
  }, [availableUsers]);

  const createVenueUser = useCreateVenueUser({
    params: { venueId },
  });

  const handleSubmit = (): void => {
    if (!userId) {
      toast({
        title: t('Please select a user'),
        variant: 'destructive',
      });
      return;
    }

    createVenueUser.mutate(
      {
        userId,
        comments: comment || '',
      },
      {
        onSuccess: () => {
          toast({
            title: t('Participant added'),
            description: t('The participant has been added to the venue'),
          });
          setOpen(false);
          setUserId('');
          setComment('');
          onSuccess?.();
        },
        onError: () => {
          toast({
            title: t('Error'),
            description: t('Failed to add participant to venue'),
            variant: 'destructive',
          });
        },
      }
    );
  };

  const selectedUserLabel = userOptions.find(
    (option) => option.value === userId
  )?.label;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 size-4" />
          <Trans>Add Participant</Trans>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            <Trans>Add Participant to</Trans> {venueName}
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
                  {selectedUserLabel ?? t('Select a user')}
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

          <div className="flex flex-col gap-2">
            <Label>
              <Trans>Comment (optional)</Trans>
            </Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('Add a note about this participant...')}
              rows={3}
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={createVenueUser.isLoading || !userId}
            className="mt-2"
          >
            {createVenueUser.isLoading ? (
              <Trans>Adding...</Trans>
            ) : (
              <Trans>Add Participant</Trans>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
