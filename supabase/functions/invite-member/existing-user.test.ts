import {
  handleInviteRequest,
  type InviteHandlerDependencies,
} from './index.ts';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

Deno.test(
  'existing recipient branch does not create or expose another identity',
  async () => {
    let identityChecks = 0;
    let deliveries = 0;
    const dependencies: InviteHandlerDependencies = {
      siteUrl: new URL('https://finance.example'),
      authenticate: async () => ({
        id: '00000000-0000-4000-8000-000000000001',
      }),
      prepareMutation: async () => ({
        result_status: 'ready',
        invite_id: '00000000-0000-4000-8000-000000000002',
        raw_token: 'a'.repeat(64),
        delivery_version: 1,
        retry_after: 0,
        email_normalized: 'existing@example.com',
        role: 'visualizador',
        locale: 'en',
        workspace_name: 'Casa',
        inviter_name: 'Admin',
      }),
      ensureRecipientIdentity: async () => {
        identityChecks += 1;
        return 'existing';
      },
      sendInvitation: async () => ({ providerMessageId: 'provider-id' }),
      recordDelivery: async () => {
        deliveries += 1;
        return { expires_at: '2026-08-18T12:00:00.000Z' };
      },
    };
    const response = await handleInviteRequest(
      new Request('https://finance.example/functions/v1/invite-member', {
        method: 'POST',
        headers: {
          authorization: 'Bearer session',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'create',
          workspace_id: '00000000-0000-4000-8000-000000000010',
          email: ' Existing@Example.com ',
          role: 'visualizador',
          locale: 'en',
        }),
      }),
      dependencies
    );
    const body = await response.json();
    assert(
      response.status === 201 && body.status === 'sent',
      'expected the shared sent contract'
    );
    assert(
      identityChecks === 1 && deliveries === 1,
      'expected one identity check and delivery'
    );
    assert(
      !('recipient_exists' in body),
      'must not enumerate existing accounts'
    );
  }
);
