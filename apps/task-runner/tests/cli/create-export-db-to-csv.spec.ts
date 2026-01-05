import { TaskType } from '@meltstudio/types';

import { createExportDbToCsv } from '@/task-runner/cli/create-export-db-to-csv';
import { TaskRunnerClient } from '@/tasks/client';

jest.mock('@/tasks/client');

describe('Export DB to CSV Command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a task with the provided email', async () => {
    const mockCreateTask = jest.fn();
    (TaskRunnerClient.getInstance as jest.Mock).mockReturnValue({
      createTask: mockCreateTask,
    });

    const command = createExportDbToCsv();

    await command.parseAsync([
      'node',
      'test',
      'export-db',
      '--email',
      'test@example.com',
      '--table-name',
      'mock-table-name',
    ]);

    expect(mockCreateTask).toHaveBeenCalledWith(
      TaskType.EXPORT_DB_TO_CSV,
      {
        email: 'test@example.com',
      },
      'mock-table-name'
    );
  });
});
