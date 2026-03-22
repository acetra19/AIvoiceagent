import { Request, Response } from 'express';
import { APP_NAME } from '../../config';

export function healthCheck(_req: Request, res: Response): void {
  res.status(200).json({
    status: 'healthy',
    service: APP_NAME,
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    memory: {
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    },
  });
}
