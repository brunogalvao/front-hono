import { describe, expect, it } from 'vitest';
import { ApiError, createApiError } from '@/lib/api-error';

describe('ApiError', () => {
  it('preserves the structured API error contract', () => {
    const error = createApiError(
      409,
      {
        error: 'Registro duplicado',
        error_code: 'duplicate_record',
        request_id: 'request-from-body',
      },
      'request-from-header'
    );

    expect(error).toBeInstanceOf(ApiError);
    expect(error.message).toBe('Registro duplicado');
    expect(error.status).toBe(409);
    expect(error.code).toBe('duplicate_record');
    expect(error.requestId).toBe('request-from-body');
  });

  it('falls back to the response header and a generic code', () => {
    const error = createApiError(503, {}, 'request-from-header');

    expect(error.message).toBe('Erro HTTP 503');
    expect(error.code).toBe('request_failed');
    expect(error.requestId).toBe('request-from-header');
  });
});
