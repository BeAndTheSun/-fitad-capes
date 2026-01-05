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
  toast,
} from '@/theme/index';
import { FileInput } from '@/ui/file-upload';
import { ImagePreview, ImagePreviewLoadErrorAction } from '@/ui/image-preview';

const profileFormSchema = z.object({
  name: z.string(),
  email: z.string().email(),
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
    const newFileData = newPhotoFile
      ? await uploadFile(newPhotoFile)
      : undefined;
    let newFileKey: string | undefined | null = newFileData?.key || undefined;

    if (!newFileKey && ignoreExistingPhoto) {
      // send null to clear the field
      newFileKey = null;
    }

    updateOwnUser({ ...values, profileImage: newFileKey });
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
