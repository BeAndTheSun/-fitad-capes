import { logRequest } from '@meltstudio/logger';
import express from 'express';
import http from 'http';

import { router } from './routes';

export const createServer = (): http.Server => {
  const app = express();

  app.use(logRequest);
  app.use('/', router);

  const server = http.createServer(app);

  return server;
};
