import { logger } from '@/task-runner/logger';
import { exampleAsyncFunction } from '@/task-runner/tasks/example';

jest.mock('@/task-runner/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('exampleAsyncFunction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should wait for 1 second and log the message when provided with valid data', async () => {
    const data = { message: 'Hello World' };

    const promise = exampleAsyncFunction(data);
    jest.advanceTimersByTime(1000);
    await promise;

    expect(logger.info).toHaveBeenCalledWith(
      `Function Triggered | Message: ${data.message}`
    );
  });

  it('should return the expected result with valid data', async () => {
    const data = { message: 'Hello World' };

    const result = exampleAsyncFunction(data);
    jest.advanceTimersByTime(1000);
    const resolvedResult = await result;

    expect(resolvedResult).toEqual({ error: null });
  });

  it('should return an error for invalid data', async () => {
    const invalidData = { message: '' }; // Invalid because message is an empty string

    const result = await exampleAsyncFunction(invalidData);

    expect(result).toEqual({ error: 'Invalid data' });
    expect(logger.info).not.toHaveBeenCalled();
  });
});
