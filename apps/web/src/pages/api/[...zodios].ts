import { app } from '@/api/index';

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default app;
