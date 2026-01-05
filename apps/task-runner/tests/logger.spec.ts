import { logger } from '@/task-runner/logger';

jest.mock('pino', () => {
  return jest.fn().mockReturnValue({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  });
});

describe('Logger Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should log messages using the logger', () => {
    const infoMessage = 'Info test message';
    const errorMessage = 'Error test message';
    const warnMessage = 'Warn test message';
    const debugMessage = 'Debug test message';

    logger.info(infoMessage);
    logger.error(errorMessage);
    logger.warn(warnMessage);
    logger.debug(debugMessage);

    expect(logger.info).toHaveBeenCalledWith(infoMessage);
    expect(logger.error).toHaveBeenCalledWith(errorMessage);
    expect(logger.warn).toHaveBeenCalledWith(warnMessage);
    expect(logger.debug).toHaveBeenCalledWith(debugMessage);
  });
});
