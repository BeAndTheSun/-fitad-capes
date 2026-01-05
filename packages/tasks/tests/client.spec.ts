// This rule was disabled as we are testing some methods that don't make use of 'this'
/* eslint-disable @typescript-eslint/unbound-method */
import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  ScanCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import type { TaskData } from '@meltstudio/types';
import { TaskStatus, TaskType } from '@meltstudio/types';
import { v4 as uuidv4 } from 'uuid';

import { dynamoDbClient } from '@/tasks/dynamo';
import { TaskRunnerClient } from '@/tasks/index';
import type {
  TaskDynamoNewImage,
  TaskImage,
  TaskImageByModel,
} from '@/tasks/types';

jest.mock('@aws-sdk/client-dynamodb');

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

jest.mock('@aws-sdk/util-dynamodb', () => ({
  marshall: jest.fn(),
  unmarshall: jest.fn(),
}));

jest.mock('@/tasks/dynamo', () => ({
  dynamoDbClient: {
    send: jest.fn(),
  },
}));

describe('TaskRunnerClient', () => {
  const mockSend = (dynamoDbClient.send as jest.Mock).mockImplementation();

  beforeEach(() => {
    (DynamoDBClient as jest.Mock).mockImplementation(() => dynamoDbClient);
    (uuidv4 as jest.Mock).mockReturnValue('mocked-uuid');
    (marshall as jest.Mock).mockReset(); // Reset marshall mock before each test
    mockSend.mockReset();
  });

  it('should return the same instance (singleton pattern)', () => {
    const instance1 = TaskRunnerClient.getInstance();
    const instance2 = TaskRunnerClient.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should create a task with the correct data', async () => {
    const taskType: TaskType = TaskType.EXAMPLE_TASK;
    const taskData: TaskData = { message: 'message' };

    mockSend.mockResolvedValue({});

    const taskRunnerClient = TaskRunnerClient.getInstance();
    await taskRunnerClient.createTask(
      taskType,
      taskData,
      'mock-ddb-table-name'
    );

    expect(mockSend).toHaveBeenCalled();
    expect(mockSend).toHaveBeenCalledWith(expect.any(PutItemCommand));
    expect(mockSend).toHaveBeenCalledTimes(1);

    expect(marshall).toHaveBeenCalledWith(
      {
        createdAt: expect.any(String),
        id: 'mocked-uuid',
        status: TaskStatus.PENDING,
        taskType,
        taskData,
      } as Record<string, unknown>,
      { removeUndefinedValues: true }
    );
  });

  it('should throw an error if DynamoDB client fails', async () => {
    const taskType: TaskType = TaskType.EXAMPLE_TASK;
    const taskData: TaskData = { message: 'message' };

    mockSend.mockRejectedValue(new Error('DynamoDB Error'));

    const taskRunnerClient = TaskRunnerClient.getInstance();

    await expect(
      taskRunnerClient.createTask(taskType, taskData, 'mock-ddb-table-name')
    ).rejects.toThrow('DynamoDB Error');
  });

  it('should retrieve a task as a record', async () => {
    const mockItem: TaskDynamoNewImage = {
      id: { S: 'mocked-uuid' },
      taskType: { S: TaskType.EXAMPLE_TASK },
      createdAt: { S: new Date().toISOString() },
      status: { S: TaskStatus.PENDING },
      taskData: { S: JSON.stringify({ message: 'message' }) },
      modelName: { S: 'users' },
    };

    mockSend.mockResolvedValue({ Item: mockItem });

    const taskRunnerClient = TaskRunnerClient.getInstance();
    const result = await taskRunnerClient.getTaskAsRecord(
      'mocked-uuid',
      'mock-ddb-table-name'
    );

    expect(mockSend).toHaveBeenCalledWith(expect.any(GetItemCommand));
    expect(result.dynamodb.NewImage).toEqual(mockItem);
  });

  it('should throw an error if task is not found in getTaskAsRecord', async () => {
    mockSend.mockResolvedValue({ Item: null });

    const taskRunnerClient = TaskRunnerClient.getInstance();

    await expect(
      taskRunnerClient.getTaskAsRecord('non-existent-id', 'mock-ddb-table-name')
    ).rejects.toThrow('Cannot get task from dynamodb');
  });

  it('should get all tasks by model', async () => {
    const mockItems: TaskDynamoNewImage[] = [
      {
        id: { S: 'mocked-uuid-1' },
        status: { S: TaskStatus.PENDING },
        taskType: { S: TaskType.EXAMPLE_TASK },
        taskData: { S: JSON.stringify({ message: 'message' }) },
        createdAt: { S: new Date().toISOString() },
        modelName: { S: 'users' },
      },
      {
        id: { S: 'mocked-uuid-2' },
        status: { S: TaskStatus.PENDING },
        taskType: { S: TaskType.EXAMPLE_TASK },
        taskData: { S: JSON.stringify({ message: 'message' }) },
        createdAt: { S: new Date().toISOString() },
        modelName: { S: 'users' },
      },
    ];

    const unmarshalledItems: TaskImageByModel[] = [
      {
        id: 'mocked-uuid-1',
        taskType: TaskType.EXAMPLE_TASK,
        status: TaskStatus.PENDING,
        taskData: { message: 'message' },
        createdAt: new Date().toISOString(),
        modelName: 'users',
      },
      {
        id: 'mocked-uuid-2',
        taskType: TaskType.EXAMPLE_TASK,
        status: TaskStatus.PENDING,
        taskData: { message: 'message' },
        createdAt: new Date().toISOString(),
        modelName: 'users',
      },
    ];

    mockSend.mockResolvedValue({ Items: mockItems });
    (unmarshall as jest.Mock).mockImplementation((item: TaskDynamoNewImage) =>
      unmarshalledItems.find((i) => i.id === item.id.S)
    );

    const taskRunnerClient = TaskRunnerClient.getInstance();
    const result = await taskRunnerClient.getTasksByModelName(
      'mock-ddb-table-name',
      'users'
    );

    expect(mockSend).toHaveBeenCalledWith(expect.any(ScanCommand));
    expect(result).toEqual(unmarshalledItems);
  });
  it('should get all tasks', async () => {
    const mockItems: TaskDynamoNewImage[] = [
      {
        id: { S: 'mocked-uuid-1' },
        status: { S: TaskStatus.PENDING },
        taskType: { S: TaskType.EXAMPLE_TASK },
        taskData: { S: JSON.stringify({ message: 'message' }) },
        createdAt: { S: new Date().toISOString() },
        modelName: { S: 'users' },
      },
      {
        id: { S: 'mocked-uuid-2' },
        status: { S: TaskStatus.PENDING },
        taskType: { S: TaskType.EXAMPLE_TASK },
        taskData: { S: JSON.stringify({ message: 'message' }) },
        createdAt: { S: new Date().toISOString() },
        modelName: { S: 'users' },
      },
    ];

    const unmarshalledItems: TaskImage[] = [
      {
        id: 'mocked-uuid-1',
        taskType: TaskType.EXAMPLE_TASK,
        status: TaskStatus.PENDING,
        taskData: { message: 'message' },
        createdAt: new Date().toISOString(),
      },
      {
        id: 'mocked-uuid-2',
        taskType: TaskType.EXAMPLE_TASK,
        status: TaskStatus.PENDING,
        taskData: { message: 'message' },
        createdAt: new Date().toISOString(),
      },
    ];

    mockSend.mockResolvedValue({ Items: mockItems });
    (unmarshall as jest.Mock).mockImplementation((item: TaskDynamoNewImage) =>
      unmarshalledItems.find((i) => i.id === item.id.S)
    );

    const taskRunnerClient = TaskRunnerClient.getInstance();
    const result = await taskRunnerClient.getAllTasks('mock-ddb-table-name');

    expect(mockSend).toHaveBeenCalledWith(expect.any(ScanCommand));
    expect(result).toEqual(unmarshalledItems);
  });

  it('should throw an error if task image is not complete on get task as record', async () => {
    const mockItem: Partial<TaskDynamoNewImage> = {
      id: { S: 'mocked-uuid' },
      taskType: { S: TaskType.EXAMPLE_TASK },
      createdAt: { S: new Date().toISOString() },
    };

    mockSend.mockResolvedValue({ Item: mockItem });

    const taskRunnerClient = TaskRunnerClient.getInstance();

    await expect(
      taskRunnerClient.getTaskAsRecord('mocked-uuid', 'mock-ddb-table-name')
    ).rejects.toThrow(/Error parsing image/);
  });

  it('should throw an error if task images are incomplete on get all tasks', async () => {
    const mockItems: Partial<TaskDynamoNewImage>[] = [
      {
        id: { S: 'mocked-uuid-1' },
        taskType: { S: TaskType.EXAMPLE_TASK },
        createdAt: { S: new Date().toISOString() },
      },
      {
        id: { S: 'mocked-uuid-2' },
        taskType: { S: TaskType.EXAMPLE_TASK },
        status: { S: TaskStatus.PENDING },
      },
    ];

    const unmarshalledItems: Partial<TaskImage>[] = [
      {
        id: 'mocked-uuid-1',
        taskType: TaskType.EXAMPLE_TASK,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'mocked-uuid-2',
        taskType: TaskType.EXAMPLE_TASK,
        status: TaskStatus.PENDING,
      },
    ];

    mockSend.mockResolvedValue({ Items: mockItems });
    (unmarshall as jest.Mock).mockImplementation((item: TaskDynamoNewImage) =>
      unmarshalledItems.find((i) => i.id === item.id.S)
    );

    const taskRunnerClient = TaskRunnerClient.getInstance();

    await expect(
      taskRunnerClient.getAllTasks('mock-ddb-table-name')
    ).rejects.toThrow(/Error parsing task/);
  });

  it('should return empty array if no tasks are found in get all tasks', async () => {
    mockSend.mockResolvedValue({ Items: [] });

    const taskRunnerClient = TaskRunnerClient.getInstance();

    await expect(
      taskRunnerClient.getAllTasks('mock-ddb-table-name')
    ).resolves.toEqual([]);
  });

  it('should retrieve a task data', async () => {
    const mockDynamoItem: TaskDynamoNewImage = {
      id: { S: 'mocked-uuid' },
      taskType: { S: TaskType.EXAMPLE_TASK },
      createdAt: { S: new Date().toISOString() },
      status: { S: TaskStatus.PENDING },
      taskData: { S: JSON.stringify({ message: 'message' }) },
      taskResult: { S: JSON.stringify({ result: 'result' }) },
      modelName: { S: 'users' },
    };

    const mockResult: TaskImage = {
      id: 'mocked-uuid',
      taskType: TaskType.EXAMPLE_TASK,
      createdAt: new Date().toISOString(),
      status: TaskStatus.PENDING,
      taskData: JSON.stringify({ message: 'message' }),
      taskResult: JSON.stringify({ result: 'result' }),
    };

    mockSend.mockResolvedValue({ Item: mockDynamoItem });

    (unmarshall as jest.Mock).mockReturnValue(mockResult);

    const taskRunnerClient = TaskRunnerClient.getInstance();
    const result = await taskRunnerClient.getTask(
      'mocked-uuid',
      'mock-ddb-table-name'
    );

    expect(mockSend).toHaveBeenCalledWith(expect.any(GetItemCommand));
    expect(result).toEqual(mockResult);
  });

  it('should throw error if task parsing is not successful', async () => {
    const mockDynamoItem: TaskDynamoNewImage = {
      id: { S: 'mocked-uuid' },
      taskType: { S: TaskType.EXAMPLE_TASK },
      createdAt: { S: new Date().toISOString() },
      status: { S: TaskStatus.PENDING },
      taskData: { S: JSON.stringify({ message: 'message' }) },
      taskResult: { S: JSON.stringify({ result: 'result' }) },
      modelName: { S: 'users' },
    };

    const mockResult: Partial<TaskImage> = {
      id: 'mocked-uuid',
      taskType: TaskType.EXAMPLE_TASK,
    };

    mockSend.mockResolvedValue({ Item: mockDynamoItem });

    (unmarshall as jest.Mock).mockReturnValue(mockResult);

    const taskRunnerClient = TaskRunnerClient.getInstance();

    await expect(
      taskRunnerClient.getTask('mocked-uuid', 'mock-ddb-table-name')
    ).rejects.toThrow(/Error parsing task/);
  });

  it('should throw an error if the task does not exist in getTask', async () => {
    mockSend.mockResolvedValue({ Item: null });

    const taskRunnerClient = TaskRunnerClient.getInstance();

    await expect(
      taskRunnerClient.getTask('non-existent-uuid', 'mock-ddb-table-name')
    ).rejects.toThrow('Cannot get task from dynamodb');
  });

  it('should throw an error if there is a parsing error when retrieving a task', async () => {
    const mockDynamoItem: Partial<TaskDynamoNewImage> = {
      id: { S: 'mocked-uuid' },
      taskType: { S: TaskType.EXAMPLE_TASK },
      createdAt: { S: new Date().toISOString() },
      // Intentionally missing required fields to trigger a parsing error
    };

    mockSend.mockResolvedValue({ Item: mockDynamoItem });

    const taskRunnerClient = TaskRunnerClient.getInstance();

    await expect(
      taskRunnerClient.getTask('mocked-uuid', 'mock-ddb-table-name')
    ).rejects.toThrow(/Error parsing image/);
  });
});
