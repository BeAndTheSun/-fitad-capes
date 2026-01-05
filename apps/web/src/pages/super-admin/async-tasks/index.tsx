import type { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { AsyncTasksTable } from '@/components/task-runner/async-tasks-table';
import { AsyncTasksLayout } from '@/layouts/async-tasks-layout';
import type { NextPageWithLayout } from '@/types/next';

const AsyncTasksPage: NextPageWithLayout = () => {
  return (
    <AsyncTasksLayout>
      <AsyncTasksTable />
    </AsyncTasksLayout>
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

export default AsyncTasksPage;
