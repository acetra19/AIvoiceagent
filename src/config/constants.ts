export const APP_NAME = 'handwerker-ai';
export const API_VERSION = 'v1';

export const RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
} as const;

export const WEBHOOK_PATHS = {
  retell: `/api/${API_VERSION}/retell-webhook`,
  health: `/api/${API_VERSION}/health`,
} as const;

export const CALL_DEFAULTS = {
  maxTranscriptLength: 50000,
  supportedIssueTypes: ['Emergency', 'Routine'] as const,
} as const;
