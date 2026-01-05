import { zodResolver } from '@hookform/resolvers/zod';
import { useChangePassword } from '@meltstudio/client-common';
import { Trans, useTranslation } from 'next-i18next';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  toast,
} from '@/theme/index';

const passwordFormSchema = z
  .object({
    oldPassword: z.string().min(1),
    newPassword: z.string().min(8),
    confirmNewPassword: z.string(),
  })
  .superRefine((val, ctx) => {
    if (val.newPassword !== val.confirmNewPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords don't match",
        path: ['confirmNewPassword'],
      });
    }
  });
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export const ChangePasswordForm: React.FC = () => {
  const { t } = useTranslation();
  const { mutateAsync: changePassword } = useChangePassword();
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    } satisfies PasswordFormValues,
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const handleSubmitPasswordForm = async (): Promise<void> => {
    try {
      const { success } = await changePassword({
        oldPassword: passwordForm.getValues('oldPassword'),
        newPassword: passwordForm.getValues('newPassword'),
      });
      if (success) {
        passwordForm.reset();
        toast({ title: t('Password updated succesfully!') });
      } else {
        toast({
          title: t('Incorrect password!'),
          variant: 'destructive',
        });
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
    <Form {...passwordForm}>
      <form
        onSubmit={passwordForm.handleSubmit(handleSubmitPasswordForm)}
        className="mb-8 grid w-full gap-2"
      >
        <FormField
          control={passwordForm.control}
          name="oldPassword"
          render={({ field }): React.ReactElement => (
            <FormItem className="w-full">
              <FormLabel className="">
                <Trans>Current password</Trans>
              </FormLabel>
              <FormControl>
                <Input {...field} type="password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={passwordForm.control}
          name="newPassword"
          render={({ field }): React.ReactElement => (
            <FormItem className="w-full">
              <FormLabel className="">
                <Trans>New password</Trans>
              </FormLabel>
              <FormControl>
                <Input {...field} type="password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={passwordForm.control}
          name="confirmNewPassword"
          render={({ field }): React.ReactElement => (
            <FormItem className="w-full">
              <FormLabel className="">
                <Trans>Confirm your new password</Trans>
              </FormLabel>
              <FormControl>
                <Input {...field} type="password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
          <Trans>Update password</Trans>
        </Button>
      </form>
    </Form>
  );
};
