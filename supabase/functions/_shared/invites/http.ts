const JSON_CONTENT_TYPE = 'application/json; charset=utf-8';

export interface ErrorBody {
  status: 'invalid' | 'expired' | 'cancelled' | 'already_accepted' | 'email_mismatch' | 'failed';
  error_code: string;
}

export function corsHeaders(request: Request, siteUrl: URL): HeadersInit {
  const origin = request.headers.get('origin');
  const allowedOrigin = origin === siteUrl.origin ? origin : siteUrl.origin;
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

export function preflightResponse(request: Request, siteUrl: URL): Response {
  return new Response(null, { status: 204, headers: corsHeaders(request, siteUrl) });
}

export function jsonResponse(
  request: Request,
  siteUrl: URL,
  body: unknown,
  status = 200,
  extraHeaders: HeadersInit = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(request, siteUrl),
      'Content-Type': JSON_CONTENT_TYPE,
      'Cache-Control': 'no-store',
      ...extraHeaders,
    },
  });
}

export function errorResponse(
  request: Request,
  siteUrl: URL,
  statusCode: number,
  errorCode: string,
  status: ErrorBody['status'] = 'failed',
): Response {
  return jsonResponse(request, siteUrl, { status, error_code: errorCode } satisfies ErrorBody, statusCode);
}

export function bearerToken(request: Request): string | null {
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) return null;
  const token = authorization.slice('Bearer '.length).trim();
  return token || null;
}
