import { Command, Option } from '@commander-js/extra-typings';
import { TaskType } from '@meltstudio/types';

import { TaskRunnerClient } from '@/tasks/client';

export const createExportModelToCsv = (): Command => {
  const command = new Command('export-model-db');
  command
    .addOption(new Option('--email <email>').makeOptionMandatory(true))
    .addOption(new Option('--table-name <tableName>').makeOptionMandatory(true))
    .addOption(new Option('--model-name <modelName>').makeOptionMandatory(true))
    .action(async (options) => {
      await TaskRunnerClient.getInstance().createTask(
        TaskType.EXPORT_MODEL_TO_CSV,
        {
          email: options.email,
          modelName: options.modelName,
        },
        options.tableName
      );
    });
  return command;
};
