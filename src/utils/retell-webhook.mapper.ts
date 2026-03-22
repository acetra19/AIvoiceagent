import type { RetellWebhookPayload } from '../models';

/** Retell POST body for call lifecycle events (subset). */
interface RetellCallObject {
  call_id: string;
  transcript?: string;
  start_timestamp?: number;
  end_timestamp?: number;
  recording_url?: string;
  retell_llm_dynamic_variables?: Record<string, string | undefined>;
  metadata?: Record<string, unknown>;
}

interface RetellNativeWebhookBody {
  event: string;
  call?: RetellCallObject;
}

function durationSeconds(call: RetellCallObject): number {
  const { start_timestamp: s, end_timestamp: e } = call;
  if (typeof s === 'number' && typeof e === 'number' && e >= s) {
    return Math.max(0, Math.round((e - s) / 1000));
  }
  return 0;
}

function pickIssueType(
  v: string | undefined,
): 'Emergency' | 'Routine' | undefined {
  if (v === 'Emergency' || v === 'Routine') return v;
  return undefined;
}

/**
 * Maps Retell's native webhook JSON to our internal webhook shape.
 * @see https://docs.retellai.com/features/register-webhook
 */
export function mapRetellCallEndedToPayload(
  body: RetellNativeWebhookBody,
): RetellWebhookPayload {
  const call = body.call!;
  const dyn = call.retell_llm_dynamic_variables ?? {};

  const payload: RetellWebhookPayload = {
    call_id: call.call_id,
    transcript: call.transcript ?? '',
    duration: durationSeconds(call),
    custom_variables: {
      customer_name: dyn.customer_name,
      customer_address: dyn.customer_address,
      issue_type: pickIssueType(dyn.issue_type),
      zip_code: dyn.zip_code,
    },
  };

  if (call.recording_url && /^https?:\/\//i.test(call.recording_url)) {
    payload.recording_url = call.recording_url;
  }

  return payload;
}

export function isRetellNativeWebhookBody(body: unknown): body is RetellNativeWebhookBody {
  if (!body || typeof body !== 'object') return false;
  const b = body as Record<string, unknown>;
  return typeof b.event === 'string' && b.call !== undefined && typeof b.call === 'object';
}
