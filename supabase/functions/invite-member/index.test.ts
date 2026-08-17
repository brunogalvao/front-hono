import type { InviteHandlerDependencies } from './index.ts';
import { handleInviteRequest } from './index.ts';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function request(body: unknown, authorization = 'Bearer test-token'): Request {
  return new Request('http://localhost/functions/v1/invite-member', {
    method: 'POST',
    headers: { authorization, 'content-type': 'application/json', origin: 'http://127.0.0.1:5173' },
    body: JSON.stringify(body),
  });
}

function dependencies(overrides: Partial<InviteHandlerDependencies> = {}): InviteHandlerDependencies {
  return {
    siteUrl: new URL('http://127.0.0.1:5173'),
    authenticate: async () => ({ id: '00000000-0000-4000-8000-000000000001' }),
    prepareMutation: async () => ({
      result_status: 'ready',
      invite_id: '00000000-0000-4000-8000-000000000002',
      raw_token: 'a'.repeat(64),
      delivery_version: 1,
      retry_after: 0,
      email_normalized: 'person@example.com',
      role: 'visualizador',
      locale: 'pt-BR',
      workspace_name: 'Casa',
      inviter_name: 'Admin',
    }),
    ensureRecipientIdentity: async () => 'existing',
    sendInvitation: async () => ({ providerMessageId: 'provider-id' }),
    recordDelivery: async () => ({ expires_at: '2026-08-18T12:00:00.000Z' }),
    ...overrides,
  };
}

Deno.test('invite-member rejects missing authentication', async () => {
  const response = await handleInviteRequest(
    request({ operation: 'create' }, ''),
    dependencies({ authenticate: async () => null }),
  );
  assert(response.status === 401, 'expected 401');
});

Deno.test('invite-member returns stable rate limit contract', async () => {
  const response = await handleInviteRequest(
    request({
      operation: 'create',
      workspace_id: '00000000-0000-4000-8000-000000000010',
      email: ' person@example.com ',
      role: 'visualizador',
      locale: 'pt-BR',
    }),
    dependencies({
      prepareMutation: async () => ({ result_status: 'rate_limited', retry_after: 90 }),
    }),
  );
  const body = await response.json();
  assert(response.status === 429, 'expected 429');
  assert(body.status === 'rate_limited' && body.retry_after === 90, 'expected stable rate-limit body');
  assert(response.headers.get('retry-after') === '90', 'expected Retry-After');
});

Deno.test('invite-member does not provision a second identity for existing recipient', async () => {
  let identityCalls = 0;
  const response = await handleInviteRequest(
    request({
      operation: 'create',
      workspace_id: '00000000-0000-4000-8000-000000000010',
      email: ' Person@Example.com ',
      role: 'visualizador',
      locale: 'en',
    }),
    dependencies({
      ensureRecipientIdentity: async (email) => {
        identityCalls += 1;
        assert(email === 'person@example.com', 'expected normalized email');
        return 'existing';
      },
    }),
  );
  const body = await response.json();
  assert(response.status === 201 && body.status === 'sent', 'expected sent contract');
  assert(identityCalls === 1, 'expected one idempotent identity check');
  assert(!('recipient_exists' in body), 'must not enumerate account existence');
});

Deno.test('invite-member records delivery failure and never reports sent', async () => {
  let recordedSuccess: boolean | undefined;
  const response = await handleInviteRequest(
    request({
      operation: 'create',
      workspace_id: '00000000-0000-4000-8000-000000000010',
      email: 'person@example.com',
      role: 'operador',
      locale: 'pt-BR',
    }),
    dependencies({
      sendInvitation: async () => {
        throw Object.assign(new Error('provider body must remain private'), { code: 'provider_unavailable' });
      },
      recordDelivery: async ({ succeeded }) => {
        recordedSuccess = succeeded;
        return { expires_at: null };
      },
    }),
  );
  const body = await response.json();
  assert(response.status === 502 && body.status === 'delivery_failed', 'expected delivery_failed');
  assert(recordedSuccess === false, 'expected failed delivery persistence');
  assert(!JSON.stringify(body).includes('provider body'), 'must sanitize provider errors');
});

Deno.test('invite-member exposes expiry only after successful provider delivery', async () => {
  let recordedSuccess: boolean | undefined;
  const response = await handleInviteRequest(
    request({
      operation: 'create',
      workspace_id: '00000000-0000-4000-8000-000000000010',
      email: 'person@example.com',
      role: 'administrador',
      locale: 'pt-BR',
    }),
    dependencies({
      recordDelivery: async ({ succeeded }) => {
        recordedSuccess = succeeded;
        return { expires_at: '2026-08-18T12:00:00.000Z' };
      },
    }),
  );
  const body = await response.json();
  assert(recordedSuccess === true, 'expected successful delivery persistence');
  assert(body.expires_at === '2026-08-18T12:00:00.000Z', 'expected persisted expiry');
});
