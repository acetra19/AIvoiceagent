import { Router } from 'express';
import { webhookAuth, validateBody, prepareRetellWebhookBody } from '../middleware';
import { retellWebhookSchema } from '../../models';
import { handleRetellWebhook } from '../controllers/webhook.controller';

const router = Router();

// Browser / uptime checks use GET; Retell always sends POST.
router.get('/retell-webhook', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    endpoint: '/api/v1/retell-webhook',
    hint: 'Retell delivers webhooks with POST + JSON. GET is not used for call events.',
  });
});

router.post(
  '/retell-webhook',
  webhookAuth,
  prepareRetellWebhookBody,
  validateBody(retellWebhookSchema),
  handleRetellWebhook,
);

export default router;
