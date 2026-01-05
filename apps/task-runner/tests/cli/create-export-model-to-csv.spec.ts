import { TaskType } from '@meltstudio/types';

import { createExportModelToCsv } from '@/task-runner/cli/create-export-model-to-csv';
import { TaskRunnerClient } from '@/tasks/client';

jest.mock('@/tasks/client');

describe('Export model to CSV Command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a task with the provided email', async () => {
    const mockCreateTask = jest.fn();
    (TaskRunnerClient.getInstance as jest.Mock).mockReturnValue({
      createTask: mockCreateTask,
    });

    const command = createExportModelToCsv();

    await command.parseAsync([
      'node',
      'test',
      'export-db',
      '--email',
      'test@example.com',
      '--table-name',
      'mock-table-name',
      '--model-name',
      'users',
    ]);

    expect(mockCreateTask).toHaveBeenCalledWith(
      TaskType.EXPORT_MODEL_TO_CSV,
      {
        email: 'test@example.com',
        modelName: 'users',
      },
      'mock-table-name'
    );
  });
});
