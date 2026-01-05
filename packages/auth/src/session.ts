import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from 'next';
import type { Session } from 'next-auth';
import { getServerSession as $getServerSession } from 'next-auth';

import { authOptions } from './options';

type GetServerSessionContext =
  | {
      req: GetServerSidePropsContext['req'];
      res: GetServerSidePropsContext['res'];
    }
  | { req: NextApiRequest; res: NextApiResponse };

export const getServerSession = (
  ctx: GetServerSessionContext
): Promise<Session | null> => $getServerSession(ctx.req, ctx.res, authOptions);
