/**
 * express 4 doesn't redirect thrown errors inside an async route to the error middleware
 * Importing 'express-async-errors' fixes that
 * The alternative is to call next(err) inside each route, but it's harder to validate
 * Other alternatives if this causes problems: https://stackoverflow.com/questions/51391080/handling-errors-in-express-async-middleware
 */
import 'express-async-errors';

import { getServerSession } from '@meltstudio/auth';
import { Db } from '@meltstudio/db';
import { logger } from '@meltstudio/logger';
import * as Sentry from '@sentry/node';
import express from 'express';
import QueryString from 'qs';

import { config } from './config';
import { ctx } from './context';
import { adminRouter } from './routers/admin';
import { chatAssistantRouter } from './routers/chat-assistant';
import { apiDef } from './routers/def';
import { featureFlagsRouter } from './routers/feature-flags';
import { historicTableRouter } from './routers/historic-table';
import { integrationsRouter } from './routers/integrations';
import { shopifyRouter } from './routers/integrations/shopify';
import { metricsRouter } from './routers/metrics';
import { reportsRouter } from './routers/reports';
import { sessionRouter } from './routers/session';
import { storageRouter } from './routers/storage';
import { taskRunnerRouter } from './routers/task-runner';
import { userWorkspacesRouter } from './routers/user-workspaces';
import { usersRouter } from './routers/users';
import { webhooksRouter } from './routers/webhooks';
import { workspaceProfileRouter } from './routers/workspace-profile';
import { ServiceError } from './types/errors';
import { isPublicPath } from './utils/auth';

export const db = new Db();

// TODO: zodios does not validate api responses
// https://github.com/ecyrbe/zodios-express/issues/100
export const app = ctx.nextApp(apiDef);

const isMultipart = /^multipart\//i;
const jsonMiddleware = express.json();

app.use((req, res, next) => {
  const type = req.get('Content-Type');
  if (!type) return next();
  if (isMultipart.test(type)) return next();
  return jsonMiddleware(req, res, next);
});

app.use(async (req, res, next) => {
  // if it's a public route just continue
  if (isPublicPath(req.path, req.method)) {
    return next();
  }

  const session = await getServerSession({ req, res });
  if (session == null || session.user?.email == null) {
    return res.status(401).json({
      message: 'Invalid session',
    });
  }
  const user = await db.user.findUniqueByEmail(session.user.email);

  if (user == null) {
    return res.status(401).json({
      message: 'User not found',
    });
  }

  req.auth = {
    user: {
      id: user.id,
      email: user.email,
    },
  };

  // Commented out for noSw until we have the roles and permissions implemented
  // // Super admin can access to all admin routes
  // const isSuperAdmin = isSuperAdminRole(user.role);
  // if (isSuperAdmin) {
  //   const superAdminUser = isSuperAdminAllowedPath(req.path, req.method);

  //   if (!superAdminUser.status) {
  //     return res.status(401).json({ message: superAdminUser.message });
  //   }
  // }

  // // TODO: validate if the user is an admin for the workspace
  // const adminUser = isAllowedPath(req.path, req.method);
  // if (!adminUser.status) {
  //   return res.status(401).json({ message: adminUser.message });
  // }

  return next();
});

// Query params deserialization to handle complex json objects
app.use((req, _, next) => {
  const parsedQuery = QueryString.parse(req.url.split('?')[1] || '');
  req.query = parsedQuery;
  next();
});

app.use('/api/session', sessionRouter);
app.use('/api/users', usersRouter);
app.use('/api/storage', storageRouter);
app.use('/api/feature-flags', featureFlagsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/workspace-profile', workspaceProfileRouter);
app.use('/api/metrics', metricsRouter);
app.use('/api/integrations', integrationsRouter);
app.use('/api/webhooks', webhooksRouter);
app.use('/api/integrations/shopify', shopifyRouter);
app.use('/api/chat-assistant', chatAssistantRouter);
app.use('/api/task-runner', taskRunnerRouter);
app.use('/api/historic-table', historicTableRouter);
app.use('/api/user-workspaces', userWorkspacesRouter);
app.use('/api/reports', reportsRouter);

// handling expected errors sent by the service layer (/api/src/services)
app.use(
  (
    err: Error,
    _: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): unknown => {
    if (res.headersSent) {
      return next(err);
    }

    if (err instanceof ServiceError) {
      return res.status(err.statusCode).json({ error: err.message });
    }

    return next(err);
  }
);

app.use(Sentry.Handlers.errorHandler());

// handling and sending errors to client
app.use(
  (
    err: Error,
    _: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): unknown => {
    if (res.headersSent) {
      return next(err);
    }

    logger.error(err.stack);
    if (config.node.env === 'production') {
      // don't show internal server errors to final users
      return res
        .status(500)
        .send({ error: 'An error has happened, please try again' });
    }
    return res.status(500).send({ error: err.message });
  }
);
