import archiver from 'archiver';

import { logger } from '@/task-runner/logger';
import type { ZipFile } from '@/task-runner/utils/archive-utils';
import { createZipArchive } from '@/task-runner/utils/archive-utils';

// Mock the external dependencies
jest.mock('archiver');
jest.mock('@/task-runner/logger');

describe('createZipArchive', () => {
  // Define types for the event callbacks
  type DataCallback = (chunk: Buffer) => void;
  type EndCallback = () => void;
  type ErrorCallback = (err: Error) => void;

  // Create mock implementation of archiver
  const mockOn = jest.fn();
  const mockAppend = jest.fn();
  const mockFinalize = jest.fn();
  const mockPointer = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup archiver mock with proper typing
    (archiver as unknown as jest.Mock).mockReturnValue({
      on: mockOn,
      append: mockAppend,
      finalize: mockFinalize,
      pointer: mockPointer,
    });

    // Setup default mock implementations with typed callbacks
    mockOn.mockImplementation(
      (event: string, callback: DataCallback | EndCallback | ErrorCallback) => {
        if (event === 'data') {
          (callback as DataCallback)(Buffer.from('test-data'));
        }
        if (event === 'end') {
          (callback as EndCallback)();
        }
      }
    );
    mockPointer.mockReturnValue(1000);
    mockFinalize.mockResolvedValue(undefined);
  });

  test('should create a zip archive with single file', async () => {
    const files: ZipFile[] = [
      {
        fileName: 'test.txt',
        fileData: 'Hello, World!',
      },
    ];

    const result = await createZipArchive(files);

    expect(archiver).toHaveBeenCalledWith('zip', { zlib: { level: 9 } });
    expect(mockAppend).toHaveBeenCalledWith('Hello, World!', {
      name: 'test.txt',
    });
    expect(mockFinalize).toHaveBeenCalled();
    expect(Buffer.isBuffer(result)).toBe(true);
    expect(logger.info).toHaveBeenCalledWith(
      'Archive completed, total bytes: 1000'
    );
  });

  test('should create a zip archive with multiple files', async () => {
    const files: ZipFile[] = [
      { fileName: 'file1.txt', fileData: 'Content 1' },
      { fileName: 'file2.txt', fileData: 'Content 2' },
      { fileName: 'file3.txt', fileData: Buffer.from('Content 3') },
    ];

    const result = await createZipArchive(files);

    expect(mockAppend).toHaveBeenCalledTimes(3);
    expect(mockAppend).toHaveBeenCalledWith('Content 1', { name: 'file1.txt' });
    expect(mockAppend).toHaveBeenCalledWith('Content 2', { name: 'file2.txt' });
    expect(mockAppend).toHaveBeenCalledWith(Buffer.from('Content 3'), {
      name: 'file3.txt',
    });
    expect(Buffer.isBuffer(result)).toBe(true);
  });

  test('should handle empty file list', async () => {
    const files: ZipFile[] = [];

    const result = await createZipArchive(files);

    expect(mockAppend).not.toHaveBeenCalled();
    expect(mockFinalize).toHaveBeenCalled();
    expect(Buffer.isBuffer(result)).toBe(true);
  });

  test('should throw error when archive creation fails', async () => {
    const error = new Error('Archive creation failed');
    mockOn.mockImplementation(
      (event: string, callback: DataCallback | EndCallback | ErrorCallback) => {
        if (event === 'error') {
          (callback as ErrorCallback)(error);
        }
      }
    );

    const files: ZipFile[] = [{ fileName: 'test.txt', fileData: 'content' }];

    await expect(createZipArchive(files)).rejects.toThrow(
      'Archive creation failed'
    );
    expect(logger.error).toHaveBeenCalledWith(error);
  });

  test('should handle different types of file data', async () => {
    const files: ZipFile[] = [
      { fileName: 'string.txt', fileData: 'string content' },
      { fileName: 'buffer.txt', fileData: Buffer.from('buffer content') },
    ];

    await createZipArchive(files);

    expect(mockAppend).toHaveBeenCalledWith('string content', {
      name: 'string.txt',
    });
    expect(mockAppend).toHaveBeenCalledWith(Buffer.from('buffer content'), {
      name: 'buffer.txt',
    });
  });
});
