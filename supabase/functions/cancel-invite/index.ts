import { createClient } from 'npm:@supabase/supabase-js@2.112.4';

import {
  bearerToken,
  jsonResponse,
  preflightResponse,
} from '../_shared/invites/http.ts';
import { isUuid } from '../_shared/invites/security.ts';

type CancelResult = {
  status:
    | 'cancelled'
    | 'already_cancelled'
    | 'forbidden'
    | 'not_found'
    | 'not_available';
  invite_id?: string;
  error_code?: string;
};

export interface CancelInviteDependencies {
  siteUrl: URL;
  authenticate: (token: string) => Promise<{ id: string } | null>;
  cancel: (inviteId: string, actorId: string) => Promise<CancelResult>;
}

function resultStatus(status: CancelResult['status']): number {
  if (status === 'forbidden') return 403;
  if (status === 'not_found') return 404;
  if (status === 'not_available') return 409;
  return 200;
}

export async function handleCancelInvite(
  request: Request,
  dependencies: CancelInviteDependencies
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

  const token = bearerToken(request);
  const actor = token
    ? await dependencies.authenticate(token).catch(() => null)
    : null;
  if (!actor) {
    return jsonResponse(
      request,
      dependencies.siteUrl,
      { status: 'failed', error_code: 'unauthorized' },
      401
    );
  }

  let inviteId: string | null = null;
  try {
    const body = (await request.json()) as { invite_id?: unknown };
    inviteId = isUuid(body.invite_id) ? body.invite_id : null;
  } catch {
    // Return stable invalid response below.
  }
  if (!inviteId) {
    return jsonResponse(
      request,
      dependencies.siteUrl,
      { status: 'invalid', error_code: 'invalid_request' },
      400
    );
  }

  try {
    const result = await dependencies.cancel(inviteId, actor.id);
    return jsonResponse(
      request,
      dependencies.siteUrl,
      result,
      resultStatus(result.status)
    );
  } catch {
    return jsonResponse(
      request,
      dependencies.siteUrl,
      { status: 'failed', error_code: 'cancel_failed' },
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
  const service = createClient(
    requiredEnv('SUPABASE_URL'),
    requiredEnv('SUPABASE_SERVICE_ROLE_KEY'),
    {
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );

  Deno.serve((request) =>
    handleCancelInvite(request, {
      siteUrl,
      authenticate: async (token) => {
        const { data, error } = await service.auth.getUser(token);
        return error || !data.user ? null : { id: data.user.id };
      },
      cancel: async (inviteId, actorId) => {
        const { data, error } = await service.rpc('cancel_workspace_invite', {
          p_invite_id: inviteId,
          p_actor_id: actorId,
        });
        if (error || !data) throw new Error('cancel_failed');
        return data as CancelResult;
      },
    })
  );
}
