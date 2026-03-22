/**
 * Strips PII from objects before any external transmission or logging.
 * Uses allowlist approach: only explicitly allowed fields pass through.
 */
export function sanitizeForExternal<T extends Record<string, unknown>>(
  data: T,
  allowedKeys: (keyof T)[],
): Partial<T> {
  const sanitized: Partial<T> = {};
  for (const key of allowedKeys) {
    if (key in data) {
      sanitized[key] = data[key];
    }
  }
  return sanitized;
}

export function normalizeZipCode(input: string | undefined | null): string | null {
  if (!input) return null;
  const cleaned = input.replace(/\s+/g, '').replace(/^D-/i, '');
  return /^\d{5}$/.test(cleaned) ? cleaned : null;
}

export function normalizePhoneNumber(input: string | undefined | null): string | null {
  if (!input) return null;
  const cleaned = input.replace(/[\s\-()]/g, '');
  return /^\+?\d{7,15}$/.test(cleaned) ? cleaned : null;
}

export function trimAndCapitalize(input: string | undefined | null): string | null {
  if (!input || !input.trim()) return null;
  const trimmed = input.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}
