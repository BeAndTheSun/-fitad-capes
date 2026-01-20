import { zodResolver } from '@hookform/resolvers/zod';
import type { User } from '@meltstudio/client-common';
import {
  useCreateUpdateUserPersonalData,
  useGetUserPersonalData,
} from '@meltstudio/client-common';
import type { FC } from 'react';
import { useForm } from 'react-hook-form';
import { Trans } from 'react-i18next';
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
  Skeleton,
  toast,
} from '@/theme/index';

const personalDataFormSchema = z.object({
  fullName: z.string().min(3, 'Name must be at least 3 characters long'),
  phoneNumber: z.string().min(3, 'Name must be at least 3 characters long'),
  fitnessGoal: z.string().min(3, 'Name must be at least 3 characters long'),
  sponsoring: z.string().min(3, 'Name must be at least 3 characters long'),
});

type PersonalDataFormValues = z.infer<typeof personalDataFormSchema>;

export const PersonalDataForm: FC<{ user: User }> = ({ user }) => {
  const { data, isLoading } = useGetUserPersonalData({
    userId: user.id,
    enabled: true,
  });

  const updatePersonalData = useCreateUpdateUserPersonalData({
    params: { userId: user.id },
  });

  const personalDataForm = useForm<PersonalDataFormValues>({
    resolver: zodResolver(personalDataFormSchema),
    values: {
      fullName: data?.fullName || user.name,
      phoneNumber: data?.phoneNumber || '',
      fitnessGoal: data?.fitnessGoal || '',
      sponsoring: data?.sponsoring || '',
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const handleSubmitPersonalDataForm = async (
    values: PersonalDataFormValues
  ): Promise<void> => {
    const { fitnessGoal, sponsoring, fullName, phoneNumber } = values;
    await updatePersonalData
      .mutateAsync({
        fitnessGoal,
        sponsoring,
        fullName,
        phoneNumber,
      })
      .then(() => {
        toast({
          title: 'Personal data updated',
          variant: 'default',
        });
      });
  };

  if (isLoading) {
    return (
      <div className="mt-8 flex flex-col gap-8">
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  return (
    <Form {...personalDataForm}>
      <form
        onSubmit={personalDataForm.handleSubmit(handleSubmitPersonalDataForm)}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-2 md:flex-row">
          <FormField
            control={personalDataForm.control}
            name="fullName"
            render={({ field }): React.ReactElement => (
              <FormItem className="flex-1">
                <FormLabel className="">
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
            control={personalDataForm.control}
            name="phoneNumber"
            render={({ field }): React.ReactElement => (
              <FormItem className="flex-1">
                <FormLabel className="">
                  <Trans>Phone Number</Trans>
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col gap-2 md:flex-row">
          <FormField
            control={personalDataForm.control}
            name="fitnessGoal"
            render={({ field }): React.ReactElement => (
              <FormItem className="flex-1">
                <FormLabel className="">
                  <Trans>Fitness Goal</Trans>
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={personalDataForm.control}
            name="sponsoring"
            render={({ field }): React.ReactElement => (
              <FormItem className="flex-1">
                <FormLabel className="">
                  <Trans>Sponsoring</Trans>
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button className="w-auto" type="submit">
          <Trans>Update</Trans>
        </Button>
      </form>
    </Form>
  );
};
