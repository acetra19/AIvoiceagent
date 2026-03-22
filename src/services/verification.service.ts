import { ProcessedCall } from '../models';
import { logger } from '../utils';

/**
 * Handles the "Verification Loop" – triggers SMS/WhatsApp
 * to confirm customer data after a call with incomplete information.
 *
 * Current implementation: logs the intent and prepares the payload.
 * TODO: Integrate Twilio SDK or forward to n8n SMS workflow.
 */
class VerificationService {
  async triggerVerification(call: ProcessedCall): Promise<void> {
    if (call.triage.data_status !== 'INCOMPLETE') return;

    const missingFields = call.triage.missing_fields;

    logger.info('Verification loop triggered', {
      callId: call.call_id,
      missingFields,
    });

    // Placeholder: In production, this sends an SMS via Twilio or
    // triggers an n8n workflow that handles the SMS/WhatsApp flow.
    await this.sendVerificationRequest(call, missingFields);
  }

  private async sendVerificationRequest(
    call: ProcessedCall,
    missingFields: string[],
  ): Promise<void> {
    const verificationPayload = {
      call_id: call.call_id,
      customer_name: call.customer_name,
      missing_fields: missingFields,
      verification_type: 'sms',
      triggered_at: new Date().toISOString(),
    };

    logger.info('Verification request prepared (placeholder)', {
      callId: call.call_id,
      payload: verificationPayload,
    });

    // TODO: Replace with actual Twilio/n8n integration:
    // await twilioClient.messages.create({ ... })
    // or
    // await axios.post(env.N8N_SMS_WEBHOOK_URL, verificationPayload)
  }
}

export const verificationService = new VerificationService();
