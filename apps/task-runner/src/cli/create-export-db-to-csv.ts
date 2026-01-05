import { Command, Option } from '@commander-js/extra-typings';
import { TaskType } from '@meltstudio/types';

import { TaskRunnerClient } from '@/tasks/client';

export const createExportDbToCsv = (): Command => {
  const command = new Command('export-db');
  command
    .addOption(new Option('--email <email>').makeOptionMandatory(true))
    .addOption(new Option('--table-name <tableName>').makeOptionMandatory(true))
    .action(async (options) => {
      await TaskRunnerClient.getInstance().createTask(
        TaskType.EXPORT_DB_TO_CSV,
        {
          email: options.email,
        },
        options.tableName
      );
    });
  return command;
};
