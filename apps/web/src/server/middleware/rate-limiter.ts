import type { NextApiRequest, NextApiResponse } from 'next';

type IpData = {
  count: number;
  lastReset: number;
};

const rateLimitMap = new Map<string, IpData>();

const LIMIT = 2; // Limiting requests to 2 per minute per IP
const WINDOW_MS = 60 * 1000; // 1 minute

export const rateLimitMiddleware = (
  handler: (req: NextApiRequest, res: NextApiResponse) => void
): ((
  req: NextApiRequest,
  res: NextApiResponse
) => void | NextApiResponse<unknown>) => {
  return (req, res) => {
    const ip: string =
      (req.headers['x-forwarded-for'] as string) ??
      req.socket.remoteAddress ??
      '';
    const limit: number = LIMIT;
    const windowMs: number = WINDOW_MS;

    const ipData = rateLimitMap.get(ip);
    // if the IP is not in the map you can just continue with the handler
    if (ipData == null) {
      rateLimitMap.set(ip, {
        count: 1,
        lastReset: Date.now(),
      });

      return handler(req, res);
    }

    if (Date.now() - ipData.lastReset > windowMs) {
      ipData.count = 0;
      ipData.lastReset = Date.now();
    }

    if (ipData.count >= limit) {
      return res.status(429).send('Too Many Requests');
    }

    ipData.count += 1;

    return handler(req, res);
  };
};
