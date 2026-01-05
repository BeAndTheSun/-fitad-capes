import { Command, Option } from '@commander-js/extra-typings';

import { logger } from '@/task-runner/logger';
import { TaskRunner } from '@/task-runner/runner';
import { TaskRunnerClient } from '@/tasks/client';

import { createExportDbToCsv } from './create-export-db-to-csv';
import { createExportModelToCsv } from './create-export-model-to-csv';
import { createExampleTask } from './example-task';

const createProcessTaskCommand = (): Command => {
  const processTask = new Command('run-task');
  processTask
    .addOption(new Option('--task-id <taskId>').makeOptionMandatory(true))
    .addOption(new Option('--table-name <tableName>').makeOptionMandatory(true))
    .action(async (options) => {
      const record = await TaskRunnerClient.getInstance().getTaskAsRecord(
        options.taskId,
        options.tableName
      );
      logger.info(`Got task record: ${JSON.stringify(record)}`);
      const runner = TaskRunner.fromRecord(record);
      await runner.run();
    });
  return processTask;
};

export async function cli(args: string[]): Promise<void> {
  const program = new Command();
  const runTask = new Command('create-task');

  program.addCommand(runTask);
  runTask.addCommand(createExportDbToCsv());
  runTask.addCommand(createExportModelToCsv());
  runTask.addCommand(createExampleTask());

  program.addCommand(createProcessTaskCommand());

  await program.parseAsync(args);
}
