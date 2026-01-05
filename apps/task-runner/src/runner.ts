import type { UpdateItemCommandInput } from '@aws-sdk/client-dynamodb';
import { UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { dynamoDbClient } from '@meltstudio/tasks';
import type { TaskFunction } from '@meltstudio/types';
import { TaskStatus } from '@meltstudio/types';
import type { DynamoDBRecord } from 'aws-lambda';

import type { TaskImage } from '@/tasks/types';
import { DynamoDBTaskRecordSchema, TaskImageSchema } from '@/tasks/types';

import { config } from './config/env';
import { logger } from './logger';
import { AsyncTasks } from './tasks';

export class TaskRunner {
  public constructor(private taskImage: TaskImage) {}

  public async run(): Promise<{ id: string; error: null | string }> {
    logger.info(`Running task ${this.taskImage.taskType}:${this.taskImage.id}`);
    if (this.taskImage.status !== TaskStatus.PENDING) {
      throw new Error('Cannot run task as status is not PENDING');
    }
    await this.changeStatus({ status: TaskStatus.PROCESSING });
    try {
      logger.info("Attempting to run task '%s'", this.taskImage.taskType);
      const { error, result } = await this.runTaskByType();
      if (error) {
        logger.error(
          "Task '%s' failed with error: %s",
          this.taskImage.id,
          error
        );
        logger.error(error);
        await this.changeStatus({ status: TaskStatus.FAILED, error });
        return { id: this.taskImage.id, error };
      }
      await this.changeStatus({ status: TaskStatus.DONE, result });
      logger.info("Task '%s' completed successfully!", this.taskImage.id);
      return { id: this.taskImage.id, error: null };
    } catch (e) {
      logger.error(e);
      await this.changeStatus({
        status: TaskStatus.FAILED,
        error: JSON.stringify(e),
      });
      return { id: this.taskImage.id, error: 'Task failed' };
    }
  }

  private async runTaskByType(): ReturnType<TaskFunction> {
    const taskFunction = AsyncTasks[this.taskImage.taskType];

    if (!taskFunction) {
      throw new Error(`Invalid task type: ${this.taskImage.taskType}`);
    }

    logger.info("Running task '%s'", this.taskImage.id);
    return taskFunction(this.taskImage.taskData);
  }

  private async changeStatus(args: {
    status: TaskStatus;
    error?: string;
    result?: unknown;
  }): Promise<void> {
    const { status, error, result } = args;

    logger.info(`Updating '${this.taskImage.id}' to '${status}'`);
    const input: UpdateItemCommandInput = {
      ExpressionAttributeNames: {
        '#S': 'status',
        '#E': 'error',
        '#R': 'taskResult',
      },
      ExpressionAttributeValues: {
        ':s': {
          S: status,
        },
        ':e': {
          S: error ?? '',
        },
        ':r': {
          S: JSON.stringify(result ?? ''),
        },
      },
      Key: marshall({
        id: this.taskImage.id,
      }),
      ReturnValues: 'ALL_NEW',
      TableName: config.storage.dynamo.tableName,
      UpdateExpression: 'SET #S = :s, #E = :e, #R = :r',
    };
    const command = new UpdateItemCommand(input);
    await dynamoDbClient.send(command);
  }

  public static fromRecord(record: DynamoDBRecord): TaskRunner {
    const result = DynamoDBTaskRecordSchema.safeParse(record);

    if (result.success) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const untypedTaskImage = unmarshall(result.data.dynamodb.NewImage);

      const taskImage = TaskImageSchema.safeParse(untypedTaskImage);
      if (taskImage.success) {
        return new TaskRunner(taskImage.data);
      }
      logger.error(taskImage.error);
    }
    throw new Error('Invalid task record');
  }
}
