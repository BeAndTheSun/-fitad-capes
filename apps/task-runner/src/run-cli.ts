import 'dotenv/config';

import { cli } from './cli';
import { logger } from './logger';

cli(process.argv).catch((error: unknown) => {
  logger.error('Error running command');
  logger.error(error);
  process.exit(1);
});
