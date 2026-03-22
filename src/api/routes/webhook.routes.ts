import { Router } from 'express';
import { webhookAuth, validateBody, prepareRetellWebhookBody } from '../middleware';
import { retellWebhookSchema } from '../../models';
import { handleRetellWebhook } from '../controllers/webhook.controller';

const router = Router();

router.post(
  '/retell-webhook',
  webhookAuth,
  prepareRetellWebhookBody,
  validateBody(retellWebhookSchema),
  handleRetellWebhook,
);

export default router;
