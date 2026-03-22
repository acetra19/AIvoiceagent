import { Request, Response, NextFunction } from 'express';
import { verify as verifyRetellSignature } from 'retell-sdk';
import { env } from '../../config';
import { AuthenticationError } from '../../utils/errors';
import { logger } from '../../utils';

/**
 * Retell account webhooks send `x-retell-signature` (see Retell docs).
 * Local tests can use `x-retell-auth` / Bearer = WEBHOOK_AUTH_TOKEN.
 */
export function webhookAuth(req: Request, _res: Response, next: NextFunction): void {
  void (async () => {
    try {
      const signature = req.headers['x-retell-signature'] as string | undefined;

      if (signature) {
        const payload = JSON.stringify(req.body);
        const ok = await verifyRetellSignature(payload, env.RETELL_API_KEY, signature);
        if (ok) {
          next();
          return;
        }
        logger.warn('Invalid Retell webhook signature', { ip: req.ip });
        next(new AuthenticationError('Invalid webhook signature'));
        return;
      }

      const token =
        (req.headers['x-retell-auth'] as string | undefined) ??
        req.headers['authorization']?.replace(/^Bearer\s+/i, '');

      if (!token || token !== env.WEBHOOK_AUTH_TOKEN) {
        logger.warn('Unauthorized webhook request', {
          ip: req.ip,
          path: req.path,
        });
        next(new AuthenticationError('Invalid or missing authentication token'));
        return;
      }

      next();
    } catch (err) {
      next(err instanceof Error ? err : new Error(String(err)));
    }
  })();
}
