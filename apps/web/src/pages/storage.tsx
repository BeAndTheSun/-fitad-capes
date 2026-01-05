import { zodResolver } from '@hookform/resolvers/zod';
import { convertSizeToShortNotation } from '@meltstudio/core';
import type { GetServerSideProps } from 'next';
import { Trans, useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useFileInput } from '@/hooks/use-file-input';
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  toast,
} from '@/theme/index';
import type { NextPageWithLayout } from '@/types/next';
import { FileInput } from '@/ui/file-upload';
import { Typography } from '@/ui/typography';

const maxFileSize = 5 * 1024 * 1024;

const singleFileFormSchema = z.object({
  file: z.instanceof(File, { message: 'No file selected' }),
});

type SingleFileFormValues = z.infer<typeof singleFileFormSchema>;

const SingleFileUploadExample: React.FC = () => {
  const { t } = useTranslation();
  const { uploadFile } = useFileInput();

  const form = useForm<SingleFileFormValues>({
    resolver: zodResolver(singleFileFormSchema),
    defaultValues: {
      file: undefined,
    },
  });

  const handleSubmit = async (values: SingleFileFormValues): Promise<void> => {
    const { file } = values;
    try {
      await uploadFile(file);
      toast({
        title: t('Files uploaded successfully!'),
      });
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
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="grid w-full gap-2"
      >
        <FormField
          control={form.control}
          name="file"
          render={({ field }): React.ReactElement => (
            <FormItem className="w-full">
              <FormLabel className="">
                <Trans>Single File</Trans>
              </FormLabel>
              <FormControl>
                <FileInput
                  onChange={(files): void => {
                    field.onChange(files[0]);
                  }}
                  onSelectFileFailure={(): void => {
                    toast({
                      title: t(`Invalid file!`),
                      variant: 'destructive',
                    });
                  }}
                  maxSize={maxFileSize}
                  accept={{ 'image/*': [] }}
                  value={field.value ? [field.value] : []}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button loading={form.formState.isSubmitting}>
          <Trans>Submit</Trans>
        </Button>
      </form>
    </Form>
  );
};

const multipleFilesMessage = 'Select 1-3 files to upload';

const multipleFilesFormSchema = z.object({
  files: z
    .array(z.instanceof(File))
    .min(1, multipleFilesMessage)
    .max(3, multipleFilesMessage),
});

type MultipleFilesFormValues = z.infer<typeof multipleFilesFormSchema>;

const MultipleFilesUploadExample: React.FC = () => {
  const { t } = useTranslation();
  const { uploadMultipleFiles } = useFileInput();

  const form = useForm<MultipleFilesFormValues>({
    resolver: zodResolver(multipleFilesFormSchema),
    defaultValues: {
      files: [] as File[],
    },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const handleSubmit = async (
    values: MultipleFilesFormValues
  ): Promise<void> => {
    const { files } = values;
    try {
      await uploadMultipleFiles(files);
      toast({
        title: t('Files uploaded successfully!'),
      });
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
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="grid w-full gap-2"
      >
        <FormField
          control={form.control}
          name="files"
          render={({ field }): React.ReactElement => (
            <FormItem className="w-full">
              <FormLabel className="">
                <Trans>Multiple files</Trans>
              </FormLabel>
              <FormControl>
                <FileInput
                  onChange={field.onChange}
                  onSelectFileFailure={(): void => {
                    toast({
                      title: t(`Some files are invalid!`),
                      description: `Max size per file is ${convertSizeToShortNotation(
                        maxFileSize
                      )}`,
                      variant: 'destructive',
                    });
                  }}
                  maxSize={maxFileSize}
                  accept={{ 'image/*': [] }}
                  value={field.value}
                  multiple
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button loading={form.formState.isSubmitting}>
          <Trans>Submit</Trans>
        </Button>
      </form>
    </Form>
  );
};

const StoragePage: NextPageWithLayout = () => {
  return (
    <div>
      <Typography.H2>
        <Trans>File Storage</Trans>
      </Typography.H2>
      <Typography.Paragraph>
        <Trans>How to save files in object storage (AWS S3).</Trans>
      </Typography.Paragraph>

      <hr className="my-4" />

      <Typography.H3>
        <Trans>Single file</Trans>
      </Typography.H3>
      <Typography.Paragraph>
        <Trans>
          Example of an input that receives only 1 file. The accept prop limits
          the file types that can be passed, and the maxSize prop limits the
          accepted max file size.
        </Trans>
      </Typography.Paragraph>

      <SingleFileUploadExample />

      <hr className="my-4" />

      <Typography.H3>
        <Trans>Multiple files</Trans>
      </Typography.H3>
      <Typography.Paragraph>
        <Trans>
          Example of an input that may receive 1-3 files. The accept prop limits
          the file types that can be passed, and the maxSize prop limits the
          accepted max file size.
        </Trans>
      </Typography.Paragraph>

      <MultipleFilesUploadExample />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  let props = {};

  if (context.locale != null) {
    const translations = await serverSideTranslations(context.locale);

    props = { ...props, ...translations };
  }

  return { props };
};

export default StoragePage;
