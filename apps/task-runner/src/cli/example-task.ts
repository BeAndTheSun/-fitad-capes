import { Command, Option } from '@commander-js/extra-typings';
import { TaskType } from '@meltstudio/types';

import { TaskRunnerClient } from '@/tasks/client';

export const createExampleTask = (): Command => {
  const command = new Command('example-task');
  command
    .addOption(new Option('--message <message>').makeOptionMandatory(true))
    .addOption(new Option('--table-name <tableName>').makeOptionMandatory(true))
    .action(async (options) => {
      await TaskRunnerClient.getInstance().createTask(
        TaskType.EXAMPLE_TASK,
        {
          message: options.message,
        },
        options.tableName
      );
    });
  return command;
};
