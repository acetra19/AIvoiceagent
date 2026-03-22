import { Request, Response, NextFunction } from 'express';
import { RetellWebhookPayload } from '../../models';
import { triageService } from '../../services/triage.service';
import { n8nService } from '../../services/n8n.service';
import { verificationService } from '../../services/verification.service';
import { logger } from '../../utils';

export async function handleRetellWebhook(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const payload = req.body as RetellWebhookPayload;

    logger.info('Retell webhook received', {
      callId: payload.call_id,
      duration: payload.duration,
    });

    const processedCall = triageService.processCall(payload);

    logger.info('Call triaged', {
      callId: processedCall.call_id,
      priority: processedCall.triage.priority,
      dataStatus: processedCall.triage.data_status,
      isBerlin: processedCall.triage.is_berlin,
    });

    const n8nResult = await n8nService.forwardToN8n(processedCall);

    if (processedCall.triage.data_status === 'INCOMPLETE') {
      await verificationService.triggerVerification(processedCall);
    }

    res.status(200).json({
      status: 'success',
      call_id: processedCall.call_id,
      priority: processedCall.triage.priority,
      data_status: processedCall.triage.data_status,
      n8n_forwarded: n8nResult.success,
    });
  } catch (error) {
    next(error);
  }
}
