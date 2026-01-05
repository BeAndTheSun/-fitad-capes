import { sendEmailTemplate } from '@meltstudio/mailing';
import { format } from 'date-fns';

import { logger } from '@/task-runner/logger';
import { databaseToCSV } from '@/task-runner/tasks/export-db-to-csv';
import {
  createZipArchive,
  exportModelToCSV,
  uploadFile,
} from '@/task-runner/utils';

// Mock dependencies
jest.mock('@meltstudio/mailing', () => ({
  sendEmailTemplate: jest.fn(),
}));

jest.mock('@/task-runner/deps/db', () => ({
  db: {
    models: {
      ModelA: { dbTableName: 'tableA' },
      ModelB: { dbTableName: 'tableB' },
    },
  },
}));

jest.mock('@/task-runner/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/task-runner/utils', () => ({
  createZipArchive: jest.fn().mockResolvedValue(Buffer.from('zipBuffer')),
  exportModelToCSV: jest.fn((model: { dbTableName: string }) => ({
    csvFileName: `${model.dbTableName}.csv`,
    csvData: `data for ${model.dbTableName}`,
  })),
  uploadFile: jest.fn().mockResolvedValue('https://example.com/download.zip'),
}));

describe('databaseToCSV', () => {
  const mockModels = {
    ModelA: { dbTableName: 'tableA' },
    ModelB: { dbTableName: 'tableB' },
  };

  const fixedDate = new Date(Date.UTC(2023, 0, 1, 12, 34, 56));
  const timestamp = format(
    new Date(Date.UTC(2023, 0, 1, 12, 34, 56)),
    'yyyyMMdd_HHmmss'
  );

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(fixedDate);
  });

  afterAll(() => {
    jest.useRealTimers(); // Restore real timers after tests complete
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return an error if the email is invalid', async () => {
    const result = await databaseToCSV({ email: 'invalid-email' });

    expect(result.error).toBeDefined();
    expect(logger.error).toHaveBeenCalledWith(
      'No valid email was given',
      expect.anything()
    );
  });

  it('should process valid email and perform all steps', async () => {
    const result = await databaseToCSV({
      email: 'test@example.com',
    });

    expect(result.error).toBeNull();
    expect(logger.info).toHaveBeenCalledWith('Exporting database to CSV');
    expect(logger.info).toHaveBeenCalledWith(
      `Creating ZIP archive: DB_${timestamp}_export.zip`
    );

    // Verify exportModelToCSV was called for each model
    expect(exportModelToCSV).toHaveBeenCalledTimes(
      Object.keys(mockModels).length
    );
    expect(exportModelToCSV).toHaveBeenCalledWith(mockModels.ModelA);
    expect(exportModelToCSV).toHaveBeenCalledWith(mockModels.ModelB);

    // Verify createZipArchive was called with the CSV data
    expect(createZipArchive).toHaveBeenCalledWith([
      {
        fileData: 'data for tableA' as Buffer | string,
        fileName: 'tableA.csv',
      },
      {
        fileData: 'data for tableB' as Buffer | string,
        fileName: 'tableB.csv',
      },
    ]);

    // Check if uploadFile was called with the correct filename and zip buffer
    expect(uploadFile).toHaveBeenCalledWith(
      `DB_${timestamp}_export.zip`,
      Buffer.from('zipBuffer')
    );

    // Verify the email sending
    expect(sendEmailTemplate).toHaveBeenCalledWith({
      template: {
        id: 'database-export',
        props: {
          downloadLink: 'https://example.com/download.zip',
        },
      },
      options: {
        to: 'test@example.com',
      },
    });

    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining('Download link:')
    );

    // Check that the archive wrote the expected number of bytes
    expect(logger.info).toHaveBeenCalledWith(
      'Email with download URL sent to test@example.com'
    );

    // Check the result
    expect(result).toEqual({
      error: null,
      result: { downloadLink: 'https://example.com/download.zip' },
    });
  });

  it('should handle errors during CSV export', async () => {
    const singleModel = {
      ModelA: { dbTableName: 'tableA' },
    };

    // Mock the CSV export function to throw an error
    (exportModelToCSV as jest.Mock).mockRejectedValueOnce(
      new Error('Export failed')
    );

    // Expect the function to throw an error
    await expect(
      databaseToCSV({
        email: 'test@example.com',
      })
    ).rejects.toThrow('Export failed');
    expect(logger.info).toHaveBeenCalledWith('Exporting database to CSV');
    expect(exportModelToCSV).toHaveBeenCalledWith(singleModel.ModelA);
  });
});
