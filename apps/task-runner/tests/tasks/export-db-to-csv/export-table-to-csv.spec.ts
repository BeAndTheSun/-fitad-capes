import { json2csv } from 'json-2-csv';

import type { DbModelRecord } from '@/db/models/db';
import { exportTableToCSV } from '@/task-runner/tasks/export-db-to-csv/export-table-to-csv';

jest.mock('json-2-csv');

describe('exportTableToCSV', () => {
  type MockDbModelRecord = {
    findMany: jest.Mock<Promise<unknown[]>>;
  };

  const mockModel: MockDbModelRecord = {
    findMany: jest.fn<Promise<unknown[]>, []>(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should convert data to CSV format', async () => {
    const mockData = [
      { id: 1, name: 'John Doe', age: 30 },
      { id: 2, name: 'Jane Doe', age: 25 },
    ];

    mockModel.findMany.mockResolvedValue(mockData);

    (json2csv as jest.Mock).mockResolvedValue(
      'id,name,age\n1,John Doe,30\n2,Jane Doe,25'
    );

    const csvResult = await exportTableToCSV(
      mockModel as unknown as DbModelRecord
    );

    expect(mockModel.findMany).toHaveBeenCalled();
    expect(json2csv).toHaveBeenCalledWith(mockData);
    expect(csvResult).toBe('id,name,age\n1,John Doe,30\n2,Jane Doe,25');
  });

  it('should handle errors when finding records', async () => {
    mockModel.findMany.mockRejectedValue(new Error('Database error'));

    await expect(
      exportTableToCSV(mockModel as unknown as DbModelRecord)
    ).rejects.toThrow('Database error');
    expect(mockModel.findMany).toHaveBeenCalled();
    expect(json2csv).not.toHaveBeenCalled(); // json2csv shouldn't be called if findMany fails
  });

  it('should handle errors during CSV conversion', async () => {
    const mockData = [
      { id: 1, name: 'John Doe', age: 30 },
      { id: 2, name: 'Jane Doe', age: 25 },
    ];

    mockModel.findMany.mockResolvedValue(mockData);

    (json2csv as jest.Mock).mockRejectedValue(new Error('Conversion error'));

    await expect(
      exportTableToCSV(mockModel as unknown as DbModelRecord)
    ).rejects.toThrow('Conversion error');
    expect(mockModel.findMany).toHaveBeenCalled();
  });
});
