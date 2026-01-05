import { logger } from '@meltstudio/logger';
import axios from 'axios';

type LogErrorFn = (error: unknown) => void;

type BaseClientFunctions = {
  logError: LogErrorFn;
};

export const createBaseClient = (): BaseClientFunctions => {
  const logError: LogErrorFn = (error) => {
    if (!axios.isAxiosError(error)) {
      logger.error(error);
      return;
    }

    if (error.response) {
      // Request made and server responded
      try {
        logger.error(JSON.stringify(error.response.data));
      } catch (parseError) {
        logger.error(error.response.data);
      }
      logger.error(error.response.status);
    } else if (error.request) {
      // The request was made but no response was received
      logger.error(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      logger.error('Error', error.message);
    }
  };

  return {
    logError,
  };
};

export default createBaseClient;
