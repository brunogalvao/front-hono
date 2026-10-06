export interface ApiErrorPayload {
  error?: unknown;
  error_code?: unknown;
  request_id?: unknown;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly requestId: string | null;

  constructor(
    message: string,
    status: number,
    code: string,
    requestId: string | null
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.requestId = requestId;
  }
}

export function createApiError(
  status: number,
  payload: ApiErrorPayload,
  responseRequestId: string | null
): ApiError {
  const message =
    typeof payload.error === 'string' ? payload.error : `Erro HTTP ${status}`;
  const code =
    typeof payload.error_code === 'string'
      ? payload.error_code
      : 'request_failed';
  const requestId =
    typeof payload.request_id === 'string'
      ? payload.request_id
      : responseRequestId;

  return new ApiError(message, status, code, requestId);
}
