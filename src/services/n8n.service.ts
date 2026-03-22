import axios from 'axios';
import { env } from '../config';
import { ProcessedCall } from '../models';
import { logger, withRetry } from '../utils';
import { ExternalServiceError } from '../utils/errors';

interface N8nForwardResult {
  success: boolean;
  statusCode?: number;
  error?: string;
}

class N8nService {
  async forwardToN8n(call: ProcessedCall): Promise<N8nForwardResult> {
    try {
      const result = await withRetry(
        () => this.sendToN8n(call),
        'n8n-forward',
      );
      return result;
    } catch (err) {
      logger.error('Failed to forward to n8n after all retries', {
        callId: call.call_id,
      });
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }

  private async sendToN8n(call: ProcessedCall): Promise<N8nForwardResult> {
    try {
      const response = await axios.post(env.N8N_WEBHOOK_URL, call, {
        headers: {
          'Content-Type': 'application/json',
          'X-Source': 'handwerker-ai',
        },
        timeout: 10000,
      });

      logger.info('Data forwarded to n8n', {
        callId: call.call_id,
        status: response.status,
      });

      return { success: true, statusCode: response.status };
    } catch (err) {
      if (axios.isAxiosError(err)) {
        throw new ExternalServiceError('n8n', err);
      }
      throw err;
    }
  }
}

export const n8nService = new N8nService();
