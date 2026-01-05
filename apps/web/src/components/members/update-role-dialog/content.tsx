import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdateUserWorkspaceRole } from '@meltstudio/client-common';
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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

import { Loading } from '@/components/common/loading';
import { useSessionUser } from '@/components/user/user-context';
import { getUserRoleName } from '@/utils/localization';

const formSchema = z.object({
  role: z.nativeEnum(UserRoleEnum),
});

type FormValues = z.infer<typeof formSchema>;

export type UserWorkspacePropsForUpdateRole = {
  userId: string;
  workspaceId: string;
  role: string;
};

export type UpdateUserWorkspaceRoleDialogContentProps = {
  userWorkspace?: UserWorkspacePropsForUpdateRole;
  onCloseDialog: () => void;
};

export const UpdateUserWorkspaceRoleDialogContent: React.FC<
  UpdateUserWorkspaceRoleDialogContentProps
> = ({ userWorkspace, onCloseDialog }) => {
  const { t } = useTranslation();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: (userWorkspace?.role as UserRoleEnum) || UserRoleEnum.MEMBER,
    } satisfies FormValues,
  });

  const { user: ownUser, invalidateUser, selectedWorkspace } = useSessionUser();

  const { mutateAsync: updateUserWorkspaceRole } = useUpdateUserWorkspaceRole({
    params: {
      workspaceId: selectedWorkspace?.id as string,
    },
  });

  if (!ownUser) return <Loading />;

  const handleSubmit = async (values: FormValues): Promise<void> => {
    try {
      if (userWorkspace) {
        await updateUserWorkspaceRole({
          role: values.role,
          userId: userWorkspace.userId,
        });
        toast({ title: t('Role updated successfully!') });
        if (ownUser.id === userWorkspace.userId) {
          await invalidateUser();
        }
        onCloseDialog();
      }
    } catch (err) {
      toast({
        title: t('Something went wrong!'),
        description: t('Please try again'),
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <FormField
          control={form.control}
          name="role"
          render={({ field }): React.ReactElement => (
            <FormItem className="mb-4 flex-1">
              <FormLabel>
                <Trans>Select role</Trans>
              </FormLabel>
              <FormControl>
                <Select
                  {...field}
                  onValueChange={(value): void => {
                    field.onChange(value);
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
          <Button className="w-full" disabled={form.formState.isSubmitting}>
            <Trans>Update</Trans>
          </Button>
        </div>
      </form>
    </Form>
  );
};
