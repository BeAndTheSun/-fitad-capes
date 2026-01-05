import expressPino from 'express-pino-logger';
import pino from 'pino';

import { config } from './config';

const logger = pino(config);

const loggerWithContext = (
  context: object
): ReturnType<typeof logger.child> => {
  return logger.child({ context });
};

export const logRequest = expressPino({
  level: 'info',
});

export { expressPino, logger, loggerWithContext };
