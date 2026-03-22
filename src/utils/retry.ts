import { logger } from './logger';
import { RETRY_CONFIG } from '../config';

export interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  onRetry?: (error: Error, attempt: number) => void;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  label: string,
  options: RetryOptions = {},
): Promise<T> {
  const {
    maxAttempts = RETRY_CONFIG.maxAttempts,
    baseDelayMs = RETRY_CONFIG.baseDelayMs,
    maxDelayMs = RETRY_CONFIG.maxDelayMs,
    onRetry,
  } = options;

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      if (attempt === maxAttempts) break;

      const jitter = Math.random() * 200;
      const delay = Math.min(baseDelayMs * Math.pow(2, attempt - 1) + jitter, maxDelayMs);

      logger.warn(`[${label}] Attempt ${attempt}/${maxAttempts} failed, retrying in ${Math.round(delay)}ms`, {
        error: lastError.message,
      });

      onRetry?.(lastError, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  logger.error(`[${label}] All ${maxAttempts} attempts failed`);
  throw lastError;
}
