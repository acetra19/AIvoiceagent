import { Request, Response, NextFunction } from 'express';
import {
  isRetellNativeWebhookBody,
  mapRetellCallEndedToPayload,
} from '../../utils/retell-webhook.mapper';

/**
 * Retell sends `{ event, call }`. We normalize to the flat shape Zod validates.
 * Other events get 204 (Retell expects quick 2xx; see Retell docs).
 */
export function prepareRetellWebhookBody(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const body = req.body;

  if (!isRetellNativeWebhookBody(body)) {
    next();
    return;
  }

  if (body.event !== 'call_ended') {
    res.status(204).send();
    return;
  }

  if (!body.call?.call_id) {
    res.status(400).json({ status: 'error', message: 'Missing call.call_id' });
    return;
  }

  req.body = mapRetellCallEndedToPayload(body);
  next();
}
