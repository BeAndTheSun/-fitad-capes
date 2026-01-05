import 'dotenv/config';

import { logger } from '@meltstudio/logger';

import { createServer } from '@/server';

import { config } from './config';

const SERVER_PORT = config.app.port ?? 4000;

function main(): void {
  const server = createServer();

  server.listen(SERVER_PORT, () => {
    logger.info(`Server is running at port ${SERVER_PORT}`);
  });
}

main();
