import { createClient } from 'npm:@supabase/supabase-js@2.95.3';

import { inviteCallbackUrl } from '../_shared/invites/config.ts';
import { jsonResponse, preflightResponse } from '../_shared/invites/http.ts';
import {
  isValidOpaqueToken,
  requestSource,
} from '../_shared/invites/security.ts';

type PrepareResult =
  | { status: 'ready'; email_normalized: string }
  | {
      status:
        | 'invalid'
        | 'expired'
        | 'cancelled'
        | 'already_accepted'
        | 'failed'
        | 'rate_limited';
      error_code: string;
      retry_after?: number;
    };

export interface PrepareInviteAuthDependencies {
  siteUrl: URL;
  prepare: (token: string, source: string) => Promise<PrepareResult>;
  generateMagicLink: (email: string) => Promise<URL>;
}

async function tokenFromRequest(request: Request): Promise<string | null> {
  const contentType = request.headers.get('content-type') ?? '';
  try {
    if (contentType.includes('application/x-www-form-urlencoded')) {
      return (await request.formData()).get('token')?.toString() ?? null;
    }
    const body = (await request.json()) as { token?: unknown };
    return typeof body.token === 'string' ? body.token : null;
  } catch {
    return null;
  }
}

function errorStatus(
  status: Exclude<PrepareResult['status'], 'ready'>
): number {
  if (status === 'rate_limited') return 429;
  if (
    status === 'expired' ||
    status === 'cancelled' ||
    status === 'already_accepted'
  )
    return 410;
  return 400;
}

export async function handlePrepareInviteAuth(
  request: Request,
  dependencies: PrepareInviteAuthDependencies
): Promise<Response> {
  if (request.method === 'OPTIONS')
    return preflightResponse(request, dependencies.siteUrl);
  if (request.method !== 'POST') {
    return jsonResponse(
      request,
      dependencies.siteUrl,
      { status: 'invalid', error_code: 'method_not_allowed' },
      405
    );
  }

  const token = await tokenFromRequest(request);
  if (!isValidOpaqueToken(token)) {
    return jsonResponse(
      request,
      dependencies.siteUrl,
      { status: 'invalid', error_code: 'invalid_invite' },
      400
    );
  }

  let prepared: PrepareResult;
  try {
    prepared = await dependencies.prepare(token, requestSource(request));
  } catch {
    return jsonResponse(
      request,
      dependencies.siteUrl,
      { status: 'failed', error_code: 'prepare_failed' },
      500
    );
  }

  if (prepared.status !== 'ready') {
    const retryAfter =
      prepared.status === 'rate_limited'
        ? Math.max(1, prepared.retry_after ?? 1)
        : null;
    return jsonResponse(
      request,
      dependencies.siteUrl,
      {
        status: prepared.status,
        error_code: prepared.error_code,
        ...(retryAfter ? { retry_after: retryAfter } : {}),
      },
      errorStatus(prepared.status),
      retryAfter ? { 'Retry-After': String(retryAfter) } : {}
    );
  }

  try {
    const magicLink = await dependencies.generateMagicLink(
      prepared.email_normalized
    );
    if (
      magicLink.protocol !== 'https:' &&
      magicLink.hostname !== '127.0.0.1' &&
      magicLink.hostname !== 'localhost'
    ) {
      throw new Error('invalid_auth_link');
    }
    return new Response(null, {
      status: 303,
      headers: {
        Location: magicLink.toString(),
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return jsonResponse(
      request,
      dependencies.siteUrl,
      { status: 'failed', error_code: 'auth_link_failed' },
      502
    );
  }
}

function requiredEnv(name: string): string {
  const value = Deno.env.get(name)?.trim();
  if (!value) throw new Error(`missing_config:${name}`);
  return value;
}

if (import.meta.main) {
  const siteUrl = new URL(requiredEnv('SITE_URL'));
  const service = createClient(
    requiredEnv('SUPABASE_URL'),
    requiredEnv('SUPABASE_SERVICE_ROLE_KEY'),
    {
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );
  const recipientLimit = Number(
    Deno.env.get('INVITE_AUTH_RATE_LIMIT_RECIPIENT_PER_HOUR') ?? '6'
  );
  const sourceLimit = Number(
    Deno.env.get('INVITE_AUTH_RATE_LIMIT_SOURCE_PER_HOUR') ?? '30'
  );

  Deno.serve((request) =>
    handlePrepareInviteAuth(request, {
      siteUrl,
      prepare: async (token, source) => {
        const { data, error } = await service.rpc(
          'prepare_workspace_invite_auth',
          {
            p_token: token,
            p_source: source,
            p_recipient_limit: recipientLimit,
            p_source_limit: sourceLimit,
          }
        );
        if (error || !data) throw new Error('prepare_failed');
        return data as PrepareResult;
      },
      generateMagicLink: async (email) => {
        const { data, error } = await service.auth.admin.generateLink({
          type: 'magiclink',
          email,
          options: { redirectTo: inviteCallbackUrl(siteUrl).toString() },
        });
        if (error || !data.properties?.action_link)
          throw new Error('auth_link_failed');
        return new URL(data.properties.action_link);
      },
    })
  );
}
