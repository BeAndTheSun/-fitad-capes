import type { NextApiRequest, NextApiResponse } from 'next';

import { rateLimitMiddleware } from '@/middleware/rate-limiter';

function handler(_req: NextApiRequest, res: NextApiResponse): void {
  return res.status(200).json({ status: 'ok' });
}

export default rateLimitMiddleware(handler);
