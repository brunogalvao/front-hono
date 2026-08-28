import { createClient } from 'npm:@supabase/supabase-js@2.112.4';

import {
  bearerToken,
  jsonResponse,
  preflightResponse,
} from '../_shared/invites/http.ts';
import { isValidOpaqueToken } from '../_shared/invites/security.ts';

type InviteOperation = 'preview' | 'accept';
type InviteResult = Record<string, unknown> & {
  status: string;
  error_code?: string;
};

export interface AcceptInviteDependencies {
  siteUrl: URL;
  authenticate: (token: string) => Promise<{ id: string } | null>;
  preview: (token: string) => Promise<InviteResult>;
  accept: (token: string) => Promise<InviteResult>;
}

function responseStatus(status: string): number {
  if (status === 'email_mismatch') return 403;
  if (status === 'invalid') return 404;
  if (
    status === 'expired' ||
    status === 'cancelled' ||
    status === 'already_accepted'
  )
    return 410;
  if (status === 'failed') return 409;
  return 200;
}

export async function handleAcceptInvite(
  request: Request,
  dependencies: AcceptInviteDependencies
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

  const sessionToken = bearerToken(request);
  const actor = sessionToken
    ? await dependencies.authenticate(sessionToken).catch(() => null)
    : null;
  if (!actor) {
    return jsonResponse(
      request,
      dependencies.siteUrl,
      { status: 'failed', error_code: 'unauthorized' },
      401
    );
  }

  let operation: InviteOperation | null = null;
  let token: string | null = null;
  try {
    const body = (await request.json()) as {
      operation?: unknown;
      token?: unknown;
    };
    operation =
      body.operation === 'preview' || body.operation === 'accept'
        ? body.operation
        : null;
    token = isValidOpaqueToken(body.token) ? body.token : null;
  } catch {
    // Return the stable invalid request below.
  }
  if (!operation || !token) {
    return jsonResponse(
      request,
      dependencies.siteUrl,
      { status: 'invalid', error_code: 'invalid_request' },
      400
    );
  }

  try {
    const result =
      operation === 'preview'
        ? await dependencies.preview(token)
        : await dependencies.accept(token);
    return jsonResponse(
      request,
      dependencies.siteUrl,
      result,
      responseStatus(result.status)
    );
  } catch {
    return jsonResponse(
      request,
      dependencies.siteUrl,
      { status: 'failed', error_code: 'invite_operation_failed' },
      500
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
  const supabaseUrl = requiredEnv('SUPABASE_URL');
  const anonKey = requiredEnv('SUPABASE_ANON_KEY');

  Deno.serve(async (request) => {
    const authorization = request.headers.get('authorization') ?? '';
    const client = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    return handleAcceptInvite(request, {
      siteUrl,
      authenticate: async () => {
        const { data, error } = await client.auth.getUser();
        return error || !data.user ? null : { id: data.user.id };
      },
      preview: async (token) => {
        const { data, error } = await client.rpc('preview_workspace_invite', {
          p_token: token,
        });
        if (error || !data) throw new Error('preview_failed');
        return data as InviteResult;
      },
      accept: async (token) => {
        const { data, error } = await client.rpc('accept_workspace_invite', {
          p_token: token,
        });
        if (error || !data) throw new Error('accept_failed');
        return data as InviteResult;
      },
    });
  });
}
