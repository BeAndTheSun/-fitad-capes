import { zodResolver } from '@hookform/resolvers/zod';
import { formatZodiosError, useInviteMember } from '@meltstudio/client-common';
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  toast,
} from '@meltstudio/theme';
import { UserRoleEnum, userRoleList } from '@meltstudio/types';
import { Trans, useTranslation } from 'next-i18next';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useSessionUser } from '@/components/user/user-context';
import { getUserRoleName } from '@/utils/localization';

const formSchema = z.object({
  email: z.string().email(),
  role: z.nativeEnum(UserRoleEnum),
});

type FormValues = z.infer<typeof formSchema>;

export type UserPropsForUpdateRole = {
  id: string;
  name: string;
};

export type InviteMemberDialogContentProps = {
  onCloseDialog: () => void;
};

export const InviteMemberDialogContent: React.FC<
  InviteMemberDialogContentProps
> = ({ onCloseDialog }) => {
  const { selectedWorkspace } = useSessionUser();
  const { t } = useTranslation();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      role: UserRoleEnum.MEMBER,
    } satisfies FormValues,
  });

  const { mutate: inviteMember, isLoading: inviteMemberIsLoading } =
    useInviteMember({ workspaceId: selectedWorkspace?.id ?? '' });

  const handleSubmit = (values: FormValues): void => {
    inviteMember(
      { ...values },
      {
        onSuccess: () => {
          toast({ title: t('Invitation sent!') });
          onCloseDialog();
        },
        onError: (error) => {
          const formattedError = formatZodiosError('inviteMember', error);
          toast({
            title: 'Something went wrong!',
            description: formattedError?.error,
            variant: 'destructive',
          });
        },
      }
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }): React.ReactElement => (
            <FormItem className="mb-4 flex-1">
              <FormLabel>
                <Trans>E-mail</Trans>
              </FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field: { onChange, ...field } }): React.ReactElement => (
            <FormItem className="mb-4 flex-1">
              <FormLabel>
                <Trans>Role</Trans>
              </FormLabel>
              <FormControl>
                <Select
                  {...field}
                  onValueChange={(value): void => {
                    onChange(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('Select a role')} />
                  </SelectTrigger>
                  <SelectContent>
                    {userRoleList.map((value) => (
                      <SelectItem key={value} value={value}>
                        {getUserRoleName(t, value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex">
          <Button className="w-full" loading={inviteMemberIsLoading}>
            <Trans>Send Invite</Trans>
          </Button>
        </div>
      </form>
    </Form>
  );
};
