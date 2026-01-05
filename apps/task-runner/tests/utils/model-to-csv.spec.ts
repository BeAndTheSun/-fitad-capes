import { json2csv } from 'json-2-csv';

import type { DbModelRecord } from '@/db/models/db';
import { exportModelToCSV } from '@/task-runner/utils';

// Mock the json2csv module
jest.mock('json-2-csv', () => ({
  json2csv: jest.fn(),
}));

describe('exportModelToCSV', () => {
  // Mock data
  const mockData = [
    { id: 1, name: 'Test 1' },
    { id: 2, name: 'Test 2' },
  ];

  const mockCsvData = 'id,name\n1,Test 1\n2,Test 2';

  // Properly type the mock function
  const mockFindMany = jest
    .fn()
    .mockResolvedValue(mockData) as jest.MockedFunction<
    () => Promise<unknown[]>
  >;

  // Mock model with properly typed mock function
  const mockModel = {
    dbTableName: 'test_table',
    findMany: mockFindMany,
  } as unknown as DbModelRecord;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Setup default mock implementations
    mockFindMany.mockResolvedValue(mockData);
    (json2csv as jest.Mock).mockReturnValue(mockCsvData);
  });

  it('should export model data to CSV format', async () => {
    const result = await exportModelToCSV(mockModel);

    expect(result).toEqual({
      csvFileName: 'test_table.csv',
      csvData: mockCsvData,
    });

    // Verify that findMany was called
    expect(mockFindMany).toHaveBeenCalledTimes(1);

    // Verify that json2csv was called with the correct data
    expect(json2csv).toHaveBeenCalledWith(mockData);
  });

  it('should handle empty data set', async () => {
    // Mock findMany to return empty array
    mockFindMany.mockResolvedValue([]);
    (json2csv as jest.Mock).mockReturnValue('');

    const result = await exportModelToCSV(mockModel);

    expect(result).toEqual({
      csvFileName: 'test_table.csv',
      csvData: '',
    });
  });

  it('should throw error if findMany fails', async () => {
    const errorMessage = 'Database query failed';
    mockFindMany.mockRejectedValue(new Error(errorMessage));

    await expect(exportModelToCSV(mockModel)).rejects.toThrow(errorMessage);
  });

  it('should throw error if json2csv conversion fails', async () => {
    const errorMessage = 'CSV conversion failed';
    (json2csv as jest.Mock).mockImplementation(() => {
      throw new Error(errorMessage);
    });

    await expect(exportModelToCSV(mockModel)).rejects.toThrow(errorMessage);
  });

  it('should generate correct filename based on model table name', async () => {
    const customFindMany = jest
      .fn()
      .mockResolvedValue([]) as jest.MockedFunction<() => Promise<unknown[]>>;

    const customModel = {
      dbTableName: 'custom_table',
      findMany: customFindMany,
    } as unknown as DbModelRecord;

    const result = await exportModelToCSV(customModel);

    expect(result.csvFileName).toBe('custom_table.csv');
  });
});
