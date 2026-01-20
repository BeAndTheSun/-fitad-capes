import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateMember } from '@meltstudio/client-common';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  useToast,
} from '@meltstudio/theme';
import { Trans, useTranslation } from 'next-i18next';
import type { FC } from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const createMemberSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type CreateMemberFormValues = z.infer<typeof createMemberSchema>;

type CreateSuperParticipantModalProps = {
  workspaceId: string;
  onSuccess?: () => void;
};

export const CreateSuperParticipantModal: FC<
  CreateSuperParticipantModalProps
> = ({ workspaceId, onSuccess }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const form = useForm<CreateMemberFormValues>({
    resolver: zodResolver(createMemberSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const createMember = useCreateMember({
    params: { workspaceId },
  });

  const onSubmit = async (values: CreateMemberFormValues): Promise<void> => {
    try {
      await createMember.mutateAsync(values);

      toast({
        title: t('Super Participant created'),
      });
      setOpen(false);
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast({
        title: t('Error creating participant'),
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Trans>Create Super Participant</Trans>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Trans>Create Super Participant</Trans>
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4 py-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans>Name</Trans>
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans>Email</Trans>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans>Password</Trans>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setOpen(false)}
              >
                <Trans>Cancel</Trans>
              </Button>
              <Button type="submit" disabled={createMember.isLoading}>
                {createMember.isLoading ? (
                  <Trans>Creating...</Trans>
                ) : (
                  <Trans>Create</Trans>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
