const TOKEN_PATTERN = /^[a-f0-9]{64}$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidOpaqueToken(value: unknown): value is string {
  return typeof value === 'string' && TOKEN_PATTERN.test(value);
}

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_PATTERN.test(value);
}

export function requestSource(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return request.headers.get('cf-connecting-ip')?.trim() || forwarded || 'unknown';
}

export function safeErrorCode(error: unknown, fallback = 'internal_error'): string {
  if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
    return error.code.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) || fallback;
  }
  if (error instanceof Error && /^(missing|invalid)_config:[A-Z0-9_]+$/.test(error.message)) {
    return error.message.replace(':', '_').toLowerCase();
  }
  return fallback;
}

export function sanitizeProviderError(status: number): string {
  if (status === 401 || status === 403) return 'provider_auth_error';
  if (status === 429) return 'provider_rate_limited';
  if (status >= 500) return 'provider_unavailable';
  return 'provider_rejected';
}
