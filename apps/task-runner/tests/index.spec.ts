// This rule was disabled as lambda return object is handled as a non typed object
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { TaskStatus, TaskType } from '@meltstudio/types';
import type { Context, DynamoDBStreamEvent } from 'aws-lambda';

import { handler } from '@/task-runner/index';
import { logger } from '@/task-runner/logger';
import { TaskRunner } from '@/task-runner/runner';

jest.mock('@/task-runner/runner');

jest.mock('@/task-runner/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('DynamoDB Stream Handler', () => {
  const mockRun = jest.fn();
  const mockFromRecord = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (TaskRunner.fromRecord as jest.Mock).mockImplementation(mockFromRecord);
    (TaskRunner.prototype.run as jest.Mock).mockImplementation(mockRun);
  });

  it('should handle valid DynamoDB insert events', async () => {
    const event: DynamoDBStreamEvent = {
      Records: [
        {
          eventSource: 'aws:dynamodb',
          eventName: 'INSERT',
          dynamodb: {
            NewImage: {},
          },
        },
      ],
    };

    mockFromRecord.mockReturnValueOnce(
      new TaskRunner({
        id: 'task-id',
        taskType: TaskType.EXAMPLE_TASK,
        status: TaskStatus.PENDING,
        createdAt: new Date().toISOString(),
      })
    );

    mockRun.mockResolvedValueOnce({ id: 'task-id', error: null });

    const context = {} as Context;
    const callback = jest.fn();

    const result = await handler(event, context, callback);

    expect(logger.info).toHaveBeenCalledWith('Starting Task Runner...');
    expect(logger.info).toHaveBeenCalledWith("Event: '%o'", event);
    expect(result).toEqual({ batchItemFailures: [] });
    expect(mockFromRecord).toHaveBeenCalledWith(event.Records[0]);
    expect(mockRun).toHaveBeenCalled();
  });

  it('should return failed tasks in batchItemFailures', async () => {
    const event: DynamoDBStreamEvent = {
      Records: [
        {
          eventSource: 'aws:dynamodb',
          eventName: 'INSERT',
          dynamodb: {
            NewImage: {},
          },
        },
      ],
    };

    mockFromRecord.mockReturnValueOnce(
      new TaskRunner({
        id: 'task-id',
        taskType: TaskType.EXAMPLE_TASK,
        status: TaskStatus.PENDING,
        createdAt: new Date().toISOString(),
      })
    );

    mockRun.mockResolvedValueOnce({ id: 'task-id', error: 'Task failed' });

    const context = {} as Context;
    const callback = jest.fn();
    const result = await handler(event, context, callback);

    expect(result).toEqual({
      batchItemFailures: [{ itemIdentifier: 'task-id' }],
    });
  });

  it('should throw an error for non-DynamoDB events', async () => {
    const context = {} as Context;
    const callback = jest.fn();

    const event: DynamoDBStreamEvent = {
      Records: [
        {
          eventName: 'INSERT',
          eventSource: 'aws:s3',
        },
      ],
    };

    await expect(handler(event, context, callback)).rejects.toThrow(
      'Event source is not from DynamoDB Stream. Ignoring'
    );
  });

  it('should not process if there are no INSERT events', async () => {
    const context = {} as Context;
    const callback = jest.fn();

    const event: DynamoDBStreamEvent = {
      Records: [
        {
          eventSource: 'aws:dynamodb',
          eventName: 'MODIFY',
          dynamodb: {
            NewImage: {},
          },
        },
      ],
    };

    const result = await handler(event, context, callback);

    expect(result).toEqual({ batchItemFailures: [] });
    expect(mockFromRecord).not.toHaveBeenCalled();
  });
});
