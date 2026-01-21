import { zodResolver } from '@hookform/resolvers/zod';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { Trans } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useGetRecord, useUpdateRecord } from '@/client-common/sdk';
import type { UserRoleEnum } from '@/common-types/auth';
import { WorkspaceUserManagement } from '@/components/admin/workspace-user-management';
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
import type { NextPageWithLayout } from '@/types/next';

const workspaceFormSchema = z.object({
  name: z.string(),
  password: z.string().optional(),
});

type WorkspaceFormValues = z.infer<typeof workspaceFormSchema>;

export type WorkspaceUser = {
  role: UserRoleEnum;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  userId?: string;
  id?: string;
};

type Workspace = {
  id: string;
  name: string;
  users: WorkspaceUser[];
};

const ManageWorkspaceRecord: React.FC<{ recordId?: string | undefined }> = ({
  recordId,
}) => {
  const { data, error, isLoading, refetch } = useGetRecord(
    'workspace',
    recordId ?? ''
  ) as {
    data: Workspace | undefined;
    error: Error | undefined;
    isLoading: boolean;
    refetch: () => void;
  };

  const updateRecord = useUpdateRecord({
    params: { model: 'workspace', id: recordId ?? '' },
  });

  const workspaceForm = useForm<WorkspaceFormValues>({
    resolver: zodResolver(workspaceFormSchema),
    defaultValues: {
      name: '',
      password: '',
    },
  });

  const onSubmit = async (values: WorkspaceFormValues): Promise<void> => {
    await updateRecord
      .mutateAsync({
        data: values,
      })
      .then(() => {
        workspaceForm.reset();
        refetch();
        toast({
          title: 'Success',
          description: 'Workspace updated successfully',
          variant: 'default',
        });
      })
      .catch(() => {
        toast({
          title: 'Error',
          description: 'Error updating workspace',
          variant: 'destructive',
        });
      });
  };

  useEffect(() => {
    if (data) {
      workspaceForm.reset({
        name: data.name,
        password: '',
      });
    }
  }, [data, workspaceForm]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">
        <Trans>Manage Workspace {data?.name}</Trans>
      </h1>
      <Form {...workspaceForm}>
        <form onSubmit={workspaceForm.handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-2 md:flex-row">
            <FormField
              control={workspaceForm.control}
              name="name"
              render={({ field }): React.ReactElement => (
                <FormItem className="flex-1">
                  <FormLabel className="">
                    <Trans>Name</Trans>
                    <span className="ml-1 text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button className="mt-4 w-auto" type="submit">
            Submit
          </Button>
        </form>
      </Form>
      <WorkspaceUserManagement workspaceId={recordId ?? ''} />
    </div>
  );
};

const ManageWorkspaceRecordPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { id } = router.query;
  const recordId = typeof id === 'string' ? id : undefined;

  return <ManageWorkspaceRecord recordId={recordId} />;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  let props = {};

  if (context.locale != null) {
    const translations = await serverSideTranslations(context.locale);

    props = { ...props, ...translations };
  }

  return { props };
};

export default ManageWorkspaceRecordPage;
