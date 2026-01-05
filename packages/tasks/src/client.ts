import type {
  GetItemCommandInput,
  PutItemCommandInput,
  ScanCommandInput,
} from '@aws-sdk/client-dynamodb';
import {
  GetItemCommand,
  PutItemCommand,
  ScanCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import type { DbModelKeys } from '@meltstudio/db/src/models/db';
import type { TaskData, TaskType } from '@meltstudio/types';
import { TaskStatus } from '@meltstudio/types';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

import { dynamoDbClient } from './dynamo';
import type { TaskImage, TaskImageByModel } from './types';
import {
  TaskImageByModelSchema,
  TaskImageSchema,
  TaskNewImageSchema,
} from './types';

export const dynamodbTaskRecord = z.object({
  eventSource: z.literal('aws:dynamodb'),
  eventName: z.literal('INSERT'),
  dynamodb: z.object({
    NewImage: TaskNewImageSchema,
  }),
});

export type SimpleDbbRecord = z.infer<typeof dynamodbTaskRecord>;
export class TaskRunnerClient {
  private static instance: TaskRunnerClient;

  public static getInstance(): TaskRunnerClient {
    if (!TaskRunnerClient.instance) {
      TaskRunnerClient.instance = new TaskRunnerClient();
    }
    return TaskRunnerClient.instance;
  }

  // eslint-disable-next-line class-methods-use-this
  public async createTask(
    taskType: TaskType,
    taskData: TaskData,
    ddbTableName: string,
    modelName?: DbModelKeys
  ): Promise<{ id: string }> {
    const id = uuidv4();

    const input: PutItemCommandInput = {
      TableName: ddbTableName,
      Item: marshall(
        {
          createdAt: new Date().toISOString(),
          id,
          status: TaskStatus.PENDING,
          taskType,
          taskData,
          modelName,
        },
        { removeUndefinedValues: true }
      ),
    };

    const command = new PutItemCommand(input);
    await dynamoDbClient.send(command);

    return { id };
  }

  // eslint-disable-next-line class-methods-use-this
  public async getTaskAsRecord(
    taskId: string,
    ddbTableName: string
  ): Promise<SimpleDbbRecord> {
    const input: GetItemCommandInput = {
      Key: {
        id: {
          S: taskId,
        },
      },
      TableName: ddbTableName,
    };
    const command = new GetItemCommand(input);
    const { Item } = await dynamoDbClient.send(command);

    if (Item == null) {
      throw new Error('Cannot get task from dynamodb');
    }

    const newImage = TaskNewImageSchema.safeParse(Item);

    if (newImage.success) {
      return {
        eventSource: 'aws:dynamodb',
        eventName: 'INSERT',
        dynamodb: {
          NewImage: newImage.data,
        },
      };
    }
    throw new Error(`Error parsing image :${JSON.stringify(newImage.error)}`);
  }

  public async getTask(
    taskId: string,
    ddbTableName: string
  ): Promise<TaskImage> {
    const image = await this.getTaskAsRecord(taskId, ddbTableName);
    const rawData = unmarshall(image.dynamodb.NewImage);

    const task = TaskImageSchema.safeParse(rawData);

    if (!task.success) {
      throw new Error(`Error parsing task: ${JSON.stringify(task.error)}`);
    }

    return task.data;
  }

  // eslint-disable-next-line class-methods-use-this
  public async getAllTasks(ddbTableName: string): Promise<TaskImage[]> {
    const input: ScanCommandInput = {
      TableName: ddbTableName,
    };
    const command = new ScanCommand(input);
    const { Items } = await dynamoDbClient.send(command);

    if (Items == null || Items.length === 0) {
      return [];
    }

    const records = Items.map((item) => {
      const rawData = unmarshall(item);

      const task = TaskImageSchema.safeParse(rawData);

      if (!task.success) {
        throw new Error(`Error parsing task: ${JSON.stringify(task.error)}`);
      }

      return task.data;
    });

    return records;
  }

  // eslint-disable-next-line class-methods-use-this
  public async getTasksByModelName(
    ddbTableName: string,
    modelName: DbModelKeys
  ): Promise<TaskImageByModel[]> {
    const input: ScanCommandInput = {
      TableName: ddbTableName,
      FilterExpression: 'modelName = :modelName',
      ExpressionAttributeValues: {
        ':modelName': { S: modelName as string },
      },
    };
    const command = new ScanCommand(input);
    const { Items } = await dynamoDbClient.send(command);

    if (Items == null || Items.length === 0) {
      return [];
    }

    const records = Items.map((item) => {
      const rawData = unmarshall(item);

      const task = TaskImageByModelSchema.safeParse(rawData);

      if (!task.success) {
        throw new Error(`Error parsing task: ${JSON.stringify(task.error)}`);
      }

      return task.data;
    });

    return records;
  }
}
