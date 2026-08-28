import {
  createClient,
  type SupabaseClient,
} from 'npm:@supabase/supabase-js@2.112.4';

import {
  inviteLandingUrl,
  loadInviteConfig,
  type InviteConfig,
  type InviteLocale,
} from '../_shared/invites/config.ts';
import {
  inviteDeliveryKey,
  renderInviteEmail,
  type InviteEmailRole,
} from '../_shared/invites/email.ts';
import {
  bearerToken,
  jsonResponse,
  preflightResponse,
} from '../_shared/invites/http.ts';
import {
  isUuid,
  normalizeEmail,
  requestSource,
  safeErrorCode,
  sanitizeProviderError,
} from '../_shared/invites/security.ts';

type InviteOperation = 'create' | 'resend';
type MutationStatus =
  | 'ready'
  | 'rate_limited'
  | 'already_member'
  | 'existing_pending_invite';

interface InviteRequestBody {
  operation: InviteOperation;
  workspace_id?: string;
  invite_id?: string;
  email?: string;
  role?: InviteEmailRole;
  locale: InviteLocale;
}

interface PreparedMutation {
  result_status: MutationStatus;
  invite_id?: string | null;
  raw_token?: string | null;
  delivery_version?: number | null;
  retry_after: number;
  email_normalized?: string;
  role?: InviteEmailRole;
  locale?: InviteLocale;
  workspace_name?: string;
  inviter_name?: string;
}

interface DeliveryInput {
  inviteId: string;
  deliveryVersion: number;
  succeeded: boolean;
  providerMessageId?: string;
  errorCode?: string;
}

interface DeliveryResult {
  expires_at: string | null;
}

interface SendInvitationInput {
  email: string;
  inviteId: string;
  deliveryVersion: number;
  rendered: ReturnType<typeof renderInviteEmail>;
}

export interface InviteHandlerDependencies {
  siteUrl: URL;
  authenticate: (token: string) => Promise<{ id: string } | null>;
  prepareMutation: (
    input: InviteRequestBody & { actorId: string; source: string }
  ) => Promise<PreparedMutation>;
  ensureRecipientIdentity: (email: string) => Promise<'created' | 'existing'>;
  sendInvitation: (
    input: SendInvitationInput
  ) => Promise<{ providerMessageId: string }>;
  recordDelivery: (input: DeliveryInput) => Promise<DeliveryResult>;
}

const ROLES = new Set<InviteEmailRole>([
  'administrador',
  'operador',
  'visualizador',
]);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseBody(value: unknown): InviteRequestBody | null {
  if (!value || typeof value !== 'object') return null;
  const body = value as Record<string, unknown>;
  const operation = body.operation;
  const locale = body.locale ?? 'pt-BR';
  if (operation !== 'create' && operation !== 'resend') return null;
  if (locale !== 'pt-BR' && locale !== 'en') return null;

  if (operation === 'create') {
    if (
      !isUuid(body.workspace_id) ||
      typeof body.email !== 'string' ||
      !EMAIL_PATTERN.test(normalizeEmail(body.email))
    ) {
      return null;
    }
    if (
      typeof body.role !== 'string' ||
      !ROLES.has(body.role as InviteEmailRole)
    )
      return null;
    return {
      operation,
      workspace_id: body.workspace_id,
      email: normalizeEmail(body.email),
      role: body.role as InviteEmailRole,
      locale,
    };
  }

  if (!isUuid(body.invite_id)) return null;
  if (body.workspace_id !== undefined && !isUuid(body.workspace_id))
    return null;
  return {
    operation,
    invite_id: body.invite_id,
    workspace_id: body.workspace_id as string | undefined,
    locale,
  };
}

function publicError(
  request: Request,
  siteUrl: URL,
  httpStatus: number,
  status: string,
  errorCode: string,
  extra: Record<string, unknown> = {}
): Response {
  return jsonResponse(
    request,
    siteUrl,
    { status, error_code: errorCode, ...extra },
    httpStatus
  );
}

export async function handleInviteRequest(
  request: Request,
  dependencies: InviteHandlerDependencies
): Promise<Response> {
  if (request.method === 'OPTIONS')
    return preflightResponse(request, dependencies.siteUrl);
  if (request.method !== 'POST') {
    return publicError(
      request,
      dependencies.siteUrl,
      405,
      'failed',
      'method_not_allowed'
    );
  }

  const token = bearerToken(request);
  const actor = token
    ? await dependencies.authenticate(token).catch(() => null)
    : null;
  if (!actor)
    return publicError(
      request,
      dependencies.siteUrl,
      401,
      'failed',
      'unauthorized'
    );

  let body: InviteRequestBody | null = null;
  try {
    body = parseBody(await request.json());
  } catch {
    // The stable invalid payload response below intentionally hides parser details.
  }
  if (!body)
    return publicError(
      request,
      dependencies.siteUrl,
      400,
      'invalid',
      'invalid_request'
    );

  let prepared: PreparedMutation;
  try {
    prepared = await dependencies.prepareMutation({
      ...body,
      actorId: actor.id,
      source: requestSource(request),
    });
  } catch (error) {
    const code = safeErrorCode(error);
    if (code === 'forbidden')
      return publicError(
        request,
        dependencies.siteUrl,
        403,
        'failed',
        'forbidden'
      );
    if (code === 'invite_not_available') {
      return publicError(
        request,
        dependencies.siteUrl,
        409,
        'not_available',
        'invite_not_available'
      );
    }
    return publicError(
      request,
      dependencies.siteUrl,
      500,
      'failed',
      'mutation_failed'
    );
  }

  if (prepared.result_status === 'rate_limited') {
    const retryAfter = Math.max(1, prepared.retry_after || 1);
    return jsonResponse(
      request,
      dependencies.siteUrl,
      {
        status: 'rate_limited',
        error_code: 'rate_limited',
        retry_after: retryAfter,
      },
      429,
      { 'Retry-After': String(retryAfter) }
    );
  }
  if (prepared.result_status === 'already_member') {
    return publicError(
      request,
      dependencies.siteUrl,
      409,
      'already_member',
      'already_member'
    );
  }
  if (prepared.result_status === 'existing_pending_invite') {
    return publicError(
      request,
      dependencies.siteUrl,
      409,
      'already_invited',
      'existing_pending_invite'
    );
  }

  const inviteId = prepared.invite_id;
  const rawToken = prepared.raw_token;
  const deliveryVersion = prepared.delivery_version;
  const email = prepared.email_normalized;
  const role = prepared.role;
  const locale = prepared.locale ?? body.locale;
  if (
    !inviteId ||
    !rawToken ||
    !deliveryVersion ||
    !email ||
    !role ||
    !prepared.workspace_name ||
    !prepared.inviter_name
  ) {
    return publicError(
      request,
      dependencies.siteUrl,
      500,
      'failed',
      'invalid_mutation_result'
    );
  }

  try {
    await dependencies.ensureRecipientIdentity(email);
  } catch (error) {
    await dependencies
      .recordDelivery({
        inviteId,
        deliveryVersion,
        succeeded: false,
        errorCode: safeErrorCode(error, 'identity_provision_failed'),
      })
      .catch(() => undefined);
    return publicError(
      request,
      dependencies.siteUrl,
      500,
      'delivery_failed',
      'identity_provision_failed'
    );
  }

  const landingUrl = inviteLandingUrl(dependencies.siteUrl, rawToken);
  const rendered = renderInviteEmail({
    locale,
    workspaceName: prepared.workspace_name,
    inviterName: prepared.inviter_name,
    role,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    landingUrl,
  });

  let providerMessageId: string;
  try {
    ({ providerMessageId } = await dependencies.sendInvitation({
      email,
      inviteId,
      deliveryVersion,
      rendered,
    }));
  } catch (error) {
    await dependencies
      .recordDelivery({
        inviteId,
        deliveryVersion,
        succeeded: false,
        errorCode: safeErrorCode(error, 'provider_error'),
      })
      .catch(() => undefined);
    return publicError(
      request,
      dependencies.siteUrl,
      502,
      'delivery_failed',
      'email_delivery_failed'
    );
  }

  let delivery: DeliveryResult;
  try {
    delivery = await dependencies.recordDelivery({
      inviteId,
      deliveryVersion,
      succeeded: true,
      providerMessageId,
    });
  } catch {
    return publicError(
      request,
      dependencies.siteUrl,
      500,
      'failed',
      'delivery_record_failed'
    );
  }

  return jsonResponse(
    request,
    dependencies.siteUrl,
    { status: 'sent', invite_id: inviteId, expires_at: delivery.expires_at },
    body.operation === 'create' ? 201 : 200
  );
}

function databaseError(
  error: { message?: string; code?: string } | null
): Error {
  const message = error?.message ?? 'database_error';
  const known = [
    'forbidden',
    'invite_not_available',
    'workspace_mismatch',
    'invalid_operation',
    'invalid_locale',
  ];
  const code =
    known.find((candidate) => message.includes(candidate)) ??
    error?.code ??
    'database_error';
  return Object.assign(new Error(code), { code });
}

function createDependencies(config: InviteConfig): InviteHandlerDependencies {
  const service = createClient(
    config.supabaseUrl,
    config.supabaseServiceRoleKey,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );

  return {
    siteUrl: config.siteUrl,
    authenticate: async (token) => {
      const { data, error } = await service.auth.getUser(token);
      if (error || !data.user) return null;
      return { id: data.user.id };
    },
    prepareMutation: async (input) => prepareMutation(service, config, input),
    ensureRecipientIdentity: async (email) =>
      ensureRecipientIdentity(service, email),
    sendInvitation: async (input) => sendInvitation(config, input),
    recordDelivery: async (input) => recordDelivery(service, input),
  };
}

async function prepareMutation(
  service: SupabaseClient,
  config: InviteConfig,
  input: InviteRequestBody & { actorId: string; source: string }
): Promise<PreparedMutation> {
  const { data, error } = await service.rpc('rotate_workspace_invite', {
    p_operation: input.operation,
    p_actor_id: input.actorId,
    p_workspace_id: input.workspace_id ?? null,
    p_invite_id: input.invite_id ?? null,
    p_email: input.email ?? null,
    p_role: input.role ?? null,
    p_locale: input.locale,
    p_source: input.source,
    p_actor_limit: config.rateLimits.actorWorkspacePerHour,
    p_recipient_limit: config.rateLimits.recipientWorkspacePerHour,
    p_source_limit: config.rateLimits.sourcePerHour,
  });
  if (error) throw databaseError(error);

  const result = Array.isArray(data) ? data[0] : data;
  if (!result || result.result_status !== 'ready')
    return result as PreparedMutation;

  const { data: invite, error: inviteError } = await service
    .from('workspace_invites')
    .select('email_normalized, role, locale, workspace_id, invited_by')
    .eq('id', result.invite_id)
    .single();
  if (inviteError || !invite) throw databaseError(inviteError);

  const [
    { data: workspace, error: workspaceError },
    { data: inviter, error: inviterError },
  ] = await Promise.all([
    service
      .from('workspaces')
      .select('name')
      .eq('id', invite.workspace_id)
      .single(),
    service
      .from('profiles')
      .select('full_name, email')
      .eq('id', invite.invited_by)
      .single(),
  ]);
  if (workspaceError || !workspace) throw databaseError(workspaceError);
  if (inviterError || !inviter) throw databaseError(inviterError);

  return {
    ...result,
    email_normalized: invite.email_normalized,
    role: invite.role,
    locale: invite.locale,
    workspace_name: workspace.name,
    inviter_name: inviter.full_name?.trim() || inviter.email,
  } as PreparedMutation;
}

async function ensureRecipientIdentity(
  service: SupabaseClient,
  email: string
): Promise<'created' | 'existing'> {
  const { data: profile, error: profileError } = await service
    .from('profiles')
    .select('id')
    .eq('email_normalized', email)
    .maybeSingle();
  if (profileError) throw databaseError(profileError);
  if (profile) return 'existing';

  const { error } = await service.auth.admin.createUser({
    email,
    email_confirm: false,
  });
  if (!error) return 'created';
  if (error.status === 422 || /already|exists|registered/i.test(error.message))
    return 'existing';
  throw Object.assign(new Error('identity_provision_failed'), {
    code: 'identity_provision_failed',
  });
}

async function sendInvitation(
  config: InviteConfig,
  input: SendInvitationInput
): Promise<{ providerMessageId: string }> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.resendApiKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': inviteDeliveryKey(
        input.inviteId,
        input.deliveryVersion
      ),
    },
    body: JSON.stringify({
      from: config.fromEmail,
      to: [input.email],
      subject: input.rendered.subject,
      html: input.rendered.html,
      text: input.rendered.text,
    }),
  });
  if (!response.ok) {
    throw Object.assign(new Error('provider_error'), {
      code: sanitizeProviderError(response.status),
    });
  }
  const payload = (await response.json()) as { id?: string };
  if (!payload.id)
    throw Object.assign(new Error('provider_invalid_response'), {
      code: 'provider_invalid_response',
    });
  return { providerMessageId: payload.id };
}

async function recordDelivery(
  service: SupabaseClient,
  input: DeliveryInput
): Promise<DeliveryResult> {
  const { data, error } = await service.rpc(
    'record_workspace_invite_delivery',
    {
      p_invite_id: input.inviteId,
      p_delivery_version: input.deliveryVersion,
      p_succeeded: input.succeeded,
      p_provider_message_id: input.providerMessageId ?? null,
      p_error_code: input.errorCode ?? null,
    }
  );
  if (error) throw databaseError(error);
  const result = Array.isArray(data) ? data[0] : data;
  if (!result) throw new Error('delivery_record_missing');
  return { expires_at: result.expires_at };
}

if (import.meta.main) {
  const config = loadInviteConfig();
  const dependencies = createDependencies(config);
  Deno.serve((request) => handleInviteRequest(request, dependencies));
}
