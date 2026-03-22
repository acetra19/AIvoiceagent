import { z } from 'zod';

export const retellWebhookSchema = z.object({
  call_id: z.string().min(1, 'call_id is required'),
  transcript: z.string().default(''),
  duration: z.coerce.number().min(0),
  recording_url: z.string().url().optional(),
  custom_variables: z
    .object({
      customer_name: z.string().optional(),
      customer_address: z.string().optional(),
      customer_phone: z.string().optional(),
      issue_type: z.enum(['Emergency', 'Routine']).optional(),
      zip_code: z.string().optional(),
    })
    .default({}),
});

export type RetellWebhookPayload = z.infer<typeof retellWebhookSchema>;
