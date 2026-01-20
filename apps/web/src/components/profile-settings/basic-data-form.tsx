import { zodResolver } from '@hookform/resolvers/zod';
import type { User } from '@meltstudio/client-common';
import { formatZodiosError, useUpdateOwnUser } from '@meltstudio/client-common';
import { useSession } from 'next-auth/react';
import { Trans, useTranslation } from 'next-i18next';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import type { UserContextProfileImageQuery } from '@/components/user/user-context';
import { useSessionUser } from '@/components/user/user-context';
import { useDataUrlFromFile } from '@/hooks/use-data-url-from-file';
import { useFileInput } from '@/hooks/use-file-input';
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
  toast,
} from '@/theme/index';
import { FileInput } from '@/ui/file-upload';
import { ImagePreview, ImagePreviewLoadErrorAction } from '@/ui/image-preview';

const profileFormSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  trainerName: z.string().optional(),
  trainerPhone: z.string().optional(),
  trainerEmail: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val || val.trim() === '' || z.string().email().safeParse(val).success,
      { message: 'Please enter a valid email address' }
    ),
  trainerAddress: z.string().optional(),
  trainerSocialUrl: z.string().optional(),
  trainerBio: z.string().optional(),
  photo: z.object({
    newFile: z.instanceof(File).optional(),
  }),
});
type ProfileFormValues = z.infer<typeof profileFormSchema>;

export type BasicDataFormProps = {
  user: User;
  profileImageQuery: UserContextProfileImageQuery;
};

export const BasicDataForm: React.FC<BasicDataFormProps> = ({
  user,
  profileImageQuery,
}) => {
  const { update: updateSession } = useSession();
  const { refetch, selectedWorkspace } = useSessionUser();
  const { uploadFile } = useFileInput();
  const [ignoreExistingPhoto, setIgnoreExistingPhoto] = useState(false);
  const { t } = useTranslation();

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    values: {
      name: user.name,
      email: user.email,
      trainerName: user.trainerName ?? '',
      trainerPhone: user.trainerPhone ?? '',
      trainerEmail: user.trainerEmail ?? '',
      trainerAddress: user.trainerAddress ?? '',
      trainerSocialUrl: user.trainerSocialUrl ?? '',
      trainerBio: user.trainerBio ?? '',
      photo: {
        newFile: undefined,
      },
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const newPhotoFile = profileForm.watch('photo.newFile');
  const existingPhotoUrl = profileImageQuery.url;

  const { mutate: updateOwnUser, isLoading } = useUpdateOwnUser(
    {
      params: { workspaceId: selectedWorkspace?.id || '' },
    },
    {
      onSuccess: async () => {
        toast({ title: t('Profile updated succesfully!') });
        await updateSession();
        await refetch();
      },
      onError: (error) => {
        const formattedError = formatZodiosError('signUp', error);
        toast({
          title: t('Something went wrong!'),
          description: formattedError?.error,
          variant: 'destructive',
        });
      },
    }
  );
  const newPhotoDataUrl = useDataUrlFromFile(newPhotoFile);

  const userPhotoUrl = newPhotoDataUrl || existingPhotoUrl || undefined;

  const showEmptyInput =
    (ignoreExistingPhoto || !profileImageQuery.id) && !newPhotoFile;

  const handleSubmitProfileForm = async (
    values: ProfileFormValues
  ): Promise<void> => {
    const normalize = (value?: string | null): string | undefined => {
      const trimmedValue = value?.trim();
      return trimmedValue || undefined;
    };

    const newFileData = newPhotoFile
      ? await uploadFile(newPhotoFile)
      : undefined;
    let newFileKey: string | undefined | null = newFileData?.key || undefined;

    if (!newFileKey && ignoreExistingPhoto) {
      // send null to clear the field
      newFileKey = null;
    }

    const { photo: _photo, ...rest } = values;

    const payload = {
      ...rest,
      trainerName: normalize(values.trainerName),
      trainerPhone: normalize(values.trainerPhone),
      trainerEmail: normalize(values.trainerEmail),
      trainerAddress: normalize(values.trainerAddress),
      trainerSocialUrl: normalize(values.trainerSocialUrl),
      trainerBio: normalize(values.trainerBio),
      profileImage: newFileKey,
    };

    const cleanedPayload = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined)
    ) as typeof payload;

    updateOwnUser(cleanedPayload);
  };

  const handleClearPhoto = async (): Promise<void> => {
    profileForm.setValue('photo.newFile', undefined);
    await profileForm.trigger('photo.newFile');
    setIgnoreExistingPhoto(true);
  };

  return (
    <Form {...profileForm}>
      <form
        onSubmit={profileForm.handleSubmit(handleSubmitProfileForm)}
        className="mb-8 grid w-full gap-2"
      >
        <div className="flex flex-col gap-2 md:flex-row">
          <FormField
            control={profileForm.control}
            name="name"
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
            control={profileForm.control}
            name="email"
            render={({ field }): React.ReactElement => (
              <FormItem className="flex-1">
                <FormLabel className="">
                  <Trans>E-mail</Trans>
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          <FormField
            control={profileForm.control}
            name="trainerName"
            render={({ field }): React.ReactElement => (
              <FormItem>
                <FormLabel>
                  <Trans>Trainer name (optional)</Trans>
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={profileForm.control}
            name="trainerPhone"
            render={({ field }): React.ReactElement => (
              <FormItem>
                <FormLabel>
                  <Trans>Phone number (optional)</Trans>
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={profileForm.control}
            name="trainerEmail"
            render={({ field }): React.ReactElement => (
              <FormItem>
                <FormLabel>
                  <Trans>Contact email (optional)</Trans>
                </FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={profileForm.control}
            name="trainerSocialUrl"
            render={({ field }): React.ReactElement => (
              <FormItem>
                <FormLabel>
                  <Trans>Social media page (optional)</Trans>
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={profileForm.control}
            name="trainerAddress"
            render={({ field }): React.ReactElement => (
              <FormItem className="md:col-span-2">
                <FormLabel>
                  <Trans>Address (optional)</Trans>
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={profileForm.control}
            name="trainerBio"
            render={({ field }): React.ReactElement => (
              <FormItem className="md:col-span-2">
                <FormLabel>
                  <Trans>Professional bio (optional)</Trans>
                </FormLabel>
                <FormControl>
                  <Textarea rows={3} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={profileForm.control}
          name="photo.newFile"
          render={({ field }): React.ReactElement => (
            <FormItem className="flex-1">
              <FormLabel>
                <Trans>Profile Photo</Trans>
              </FormLabel>
              {showEmptyInput ? (
                <FileInput
                  onChange={(files): void => {
                    field.onChange(files[0]);
                  }}
                  value={field.value ? [field.value] : []}
                  accept={{ 'image/*': [] }}
                  control={FormControl}
                />
              ) : (
                <ImagePreview
                  loadErrorAction={
                    // show error icon if the image comes from AWS/Vercel, or remove the photo if the file is new (loaded from input)
                    userPhotoUrl === existingPhotoUrl
                      ? ImagePreviewLoadErrorAction.showErrorIcon
                      : ImagePreviewLoadErrorAction.clearPhoto
                  }
                  photoUrl={userPhotoUrl}
                  profileImageQuery={profileImageQuery}
                  onClearPhoto={handleClearPhoto}
                />
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-auto" type="submit" loading={isLoading}>
          <Trans>Save data</Trans>
        </Button>
      </form>
    </Form>
  );
};
