import pino from 'pino';

// We use a custom logger as AWS CloudWatch doesn't support colorized logs
const config: pino.LoggerOptions = {
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: false,
    },
  },
};

export { config };

export const logger = pino(config);
