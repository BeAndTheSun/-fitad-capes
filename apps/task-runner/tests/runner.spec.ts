// This rule was disabled as we are testing some methods that don't make use of 'this'
/* eslint-disable @typescript-eslint/unbound-method */
import { dynamoDbClient } from '@meltstudio/tasks';
import { TaskStatus, TaskType } from '@meltstudio/types';
import type { DynamoDBRecord } from 'aws-lambda';

import { logger } from '@/task-runner/logger';
import { TaskRunner } from '@/task-runner/runner';
import { AsyncTasks } from '@/task-runner/tasks';
import type { TaskDynamoNewImage, TaskImage } from '@/tasks/types';

// Mock dependencies
jest.mock('@aws-sdk/client-dynamodb', () => ({
  UpdateItemCommand: jest.fn(),
}));

jest.mock('@meltstudio/tasks', () => ({
  dynamoDbClient: {
    send: jest.fn(),
  },
}));

jest.mock('@/task-runner/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/task-runner/tasks', () => ({
  AsyncTasks: {
    EXAMPLE_TASK: jest.fn(),
    EXPORT_DB_TO_CSV: jest.fn(),
  },
}));

describe('TaskRunner', () => {
  const taskImage: TaskImage = {
    id: 'task-id',
    taskType: TaskType.EXAMPLE_TASK,
    taskData: '{"message":"Test"}',
    status: TaskStatus.PENDING,
    createdAt: new Date().toISOString(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should run a task successfully', async () => {
    (AsyncTasks.EXAMPLE_TASK as jest.Mock).mockResolvedValue({ error: null });

    const taskRunner = new TaskRunner(taskImage);
    const result = await taskRunner.run();

    expect(logger.info).toHaveBeenCalledWith(
      `Running task EXAMPLE_TASK:task-id`
    );
    expect(AsyncTasks.EXAMPLE_TASK).toHaveBeenCalledWith(taskImage.taskData);
    expect(dynamoDbClient.send).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ id: 'task-id', error: null });
  });

  it('should handle task failure', async () => {
    (AsyncTasks.EXAMPLE_TASK as jest.Mock).mockResolvedValue({
      error: 'Task error',
    });

    const taskRunner = new TaskRunner(taskImage);
    const result = await taskRunner.run();

    expect(logger.info).toHaveBeenCalledWith(
      'Running task EXAMPLE_TASK:task-id'
    );
    expect(logger.error).toHaveBeenCalledWith('Task error');
    expect(dynamoDbClient.send).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ id: 'task-id', error: 'Task error' });
  });

  it('should throw an error when task status is not PENDING', async () => {
    const invalidTaskImage = { ...taskImage, status: TaskStatus.DONE };
    const taskRunner = new TaskRunner(invalidTaskImage);

    await expect(taskRunner.run()).rejects.toThrow(
      'Cannot run task as status is not PENDING'
    );
  });

  it('should throw an error for invalid task type', async () => {
    const invalidTaskImage = {
      ...taskImage,
      taskType: 'INVALID_TASK_TYPE' as TaskType,
    };
    const taskRunner = new TaskRunner(invalidTaskImage);

    await expect(taskRunner.run()).resolves.toStrictEqual({
      error: 'Task failed',
      id: 'task-id',
    });
  });

  it('should update task status correctly', async () => {
    (AsyncTasks.EXAMPLE_TASK as jest.Mock).mockResolvedValue({ error: null });

    const taskRunner = new TaskRunner(taskImage);
    await taskRunner.run();

    expect(dynamoDbClient.send).toHaveBeenCalledTimes(2);
    expect(dynamoDbClient.send).toHaveBeenCalledWith(expect.any(Object));
  });

  it('should handle invalid task records', () => {
    const invalidRecord = {};

    expect(() => TaskRunner.fromRecord(invalidRecord)).toThrow(
      'Invalid task record'
    );
  });

  it('should create a TaskRunner from a valid DynamoDB record', () => {
    const imageRecord: TaskDynamoNewImage = {
      id: { S: 'task-id' },
      taskType: { S: TaskType.EXAMPLE_TASK },
      taskData: { S: '{"message":"Test"}' },
      status: { S: TaskStatus.PENDING },
      createdAt: { S: new Date().toISOString() },
      modelName: { S: 'users' },
    };

    const validRecord: DynamoDBRecord = {
      dynamodb: {
        NewImage: imageRecord,
      },
    };

    const taskRunner = TaskRunner.fromRecord(validRecord);

    expect(taskRunner).toBeInstanceOf(TaskRunner);
    expect(taskRunner).toHaveProperty('taskImage.id', 'task-id');
    expect(taskRunner).toHaveProperty(
      'taskImage.taskType',
      TaskType.EXAMPLE_TASK
    );
    expect(taskRunner).toHaveProperty('taskImage.status', TaskStatus.PENDING);
  });

  it('should log an error and throw for invalid task images', () => {
    const invalidRecord: DynamoDBRecord = {
      dynamodb: {
        NewImage: {
          id: { S: 'task-id' },
          taskType: { S: 'INVALID_TASK_TYPE' },
          taskData: { S: '{"message":"Test"}' },
          status: { S: TaskStatus.PENDING },
        },
      },
    };

    const taskRunner = (): TaskRunner => TaskRunner.fromRecord(invalidRecord);

    expect(taskRunner).toThrow('Invalid task record');
    expect(logger.error).toHaveBeenCalled();
  });

  it('should run EXPORT_DB_TO_CSV successfully', async () => {
    const exportTaskImage: TaskImage = {
      id: 'task-id',
      taskType: TaskType.EXPORT_DB_TO_CSV,
      status: TaskStatus.PENDING,
      createdAt: new Date().toISOString(),
    };

    (AsyncTasks.EXPORT_DB_TO_CSV as jest.Mock).mockResolvedValue({
      error: null,
    });

    const taskRunner = new TaskRunner(exportTaskImage);
    const result = await taskRunner.run();

    expect(logger.info).toHaveBeenCalledWith(
      `Running task EXPORT_DB_TO_CSV:task-id`
    );
    expect(AsyncTasks.EXPORT_DB_TO_CSV).toHaveBeenCalledWith(
      exportTaskImage.taskData
    );
    expect(dynamoDbClient.send).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ id: 'task-id', error: null });
  });
});
