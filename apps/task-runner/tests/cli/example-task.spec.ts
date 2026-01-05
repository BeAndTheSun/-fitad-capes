import { TaskType } from '@meltstudio/types';

import { createExampleTask } from '@/task-runner/cli/example-task';
import { TaskRunnerClient } from '@/tasks/client';

// Mock the necessary imports
jest.mock('@/tasks/client');

describe('Example Task Command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a task with the provided message', async () => {
    const mockCreateTask = jest.fn();
    (TaskRunnerClient.getInstance as jest.Mock).mockReturnValue({
      createTask: mockCreateTask,
    });

    const command = createExampleTask();

    await command.parseAsync([
      'node',
      'test',
      'example-task',
      '--message',
      'Hello, World!',
      '--table-name',
      'mock-table-name',
    ]);

    expect(mockCreateTask).toHaveBeenCalledWith(
      TaskType.EXAMPLE_TASK,
      {
        message: 'Hello, World!',
      },
      'mock-table-name'
    );
  });
});
