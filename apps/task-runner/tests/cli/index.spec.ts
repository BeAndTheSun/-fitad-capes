// This is disabled as task runner client have methods without 'this'
/* eslint-disable @typescript-eslint/unbound-method */
import { cli } from '@/task-runner/cli';
import { logger } from '@/task-runner/logger';
import { TaskRunner } from '@/task-runner/runner';
import { TaskRunnerClient } from '@/tasks/client';

jest.mock('@/tasks/client');
jest.mock('@/task-runner/logger');
jest.mock('@/task-runner/runner');

describe('CLI runner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should execute process-task command successfully', async () => {
    const mockTaskRecord = { id: '1', name: 'Sample Task' };
    const mockRun = jest.fn();

    (TaskRunnerClient.getInstance as jest.Mock).mockReturnValue({
      getTaskAsRecord: jest.fn().mockResolvedValue(mockTaskRecord),
    });

    (TaskRunner.fromRecord as jest.Mock).mockReturnValue({
      run: mockRun,
    });

    const args = [
      'node',
      'cli.js',
      'run-task',
      '--task-id',
      '1',
      '--table-name',
      'mock-table-name',
    ];
    await cli(args);

    expect(TaskRunnerClient.getInstance().getTaskAsRecord).toHaveBeenCalledWith(
      '1',
      'mock-table-name'
    );
    expect(logger.info).toHaveBeenCalledWith(
      `Got task record: ${JSON.stringify(mockTaskRecord)}`
    );
    expect(mockRun).toHaveBeenCalled();
  });
});
