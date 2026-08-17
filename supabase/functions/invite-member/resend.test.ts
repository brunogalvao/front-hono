import {
  handleInviteRequest,
  type InviteHandlerDependencies,
} from './index.ts';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

Deno.test(
  'resend uses the rotated delivery version for provider idempotency',
  async () => {
    let sentVersion = 0;
    const dependencies: InviteHandlerDependencies = {
      siteUrl: new URL('https://finance.example'),
      authenticate: async () => ({
        id: '00000000-0000-4000-8000-000000000001',
      }),
      prepareMutation: async (input) => {
        assert(input.operation === 'resend', 'expected resend operation');
        return {
          result_status: 'ready',
          invite_id: '00000000-0000-4000-8000-000000000002',
          raw_token: 'b'.repeat(64),
          delivery_version: 4,
          retry_after: 0,
          email_normalized: 'person@example.com',
          role: 'operador',
          locale: 'en',
          workspace_name: 'Casa',
          inviter_name: 'Admin',
        };
      },
      ensureRecipientIdentity: async () => 'existing',
      sendInvitation: async ({ deliveryVersion }) => {
        sentVersion = deliveryVersion;
        return { providerMessageId: 'provider-id' };
      },
      recordDelivery: async () => ({ expires_at: '2026-08-18T12:00:00.000Z' }),
    };
    const response = await handleInviteRequest(
      new Request('https://finance.example/functions/v1/invite-member', {
        method: 'POST',
        headers: {
          authorization: 'Bearer session',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'resend',
          invite_id: '00000000-0000-4000-8000-000000000002',
          locale: 'en',
        }),
      }),
      dependencies
    );
    assert(response.status === 200, 'expected successful resend');
    assert(sentVersion === 4, 'expected rotated delivery version');
  }
);

Deno.test(
  'resend keeps stable 429 response and does not call provider',
  async () => {
    let providerCalls = 0;
    const dependencies: InviteHandlerDependencies = {
      siteUrl: new URL('https://finance.example'),
      authenticate: async () => ({
        id: '00000000-0000-4000-8000-000000000001',
      }),
      prepareMutation: async () => ({
        result_status: 'rate_limited',
        retry_after: 45,
      }),
      ensureRecipientIdentity: async () => 'existing',
      sendInvitation: async () => {
        providerCalls += 1;
        return { providerMessageId: 'unexpected' };
      },
      recordDelivery: async () => ({ expires_at: null }),
    };
    const response = await handleInviteRequest(
      new Request('https://finance.example/functions/v1/invite-member', {
        method: 'POST',
        headers: {
          authorization: 'Bearer session',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'resend',
          invite_id: '00000000-0000-4000-8000-000000000002',
          locale: 'pt-BR',
        }),
      }),
      dependencies
    );
    assert(
      response.status === 429 && response.headers.get('retry-after') === '45',
      'expected Retry-After'
    );
    assert(
      providerCalls === 0,
      'rate-limited requests must not reach provider'
    );
  }
);
