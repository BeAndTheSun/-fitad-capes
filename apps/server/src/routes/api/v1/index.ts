import { Router } from 'express';

import { usersRouter } from './users';

export const v1Router = Router();

v1Router.use('/users', usersRouter);
