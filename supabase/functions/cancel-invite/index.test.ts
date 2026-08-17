import { handleCancelInvite, type CancelInviteDependencies } from './index.ts';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function request(
  inviteId: unknown = '00000000-0000-4000-8000-000000000002'
): Request {
  return new Request('https://finance.example/functions/v1/cancel-invite', {
    method: 'POST',
    headers: {
      authorization: 'Bearer session',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ invite_id: inviteId }),
  });
}

function dependencies(
  overrides: Partial<CancelInviteDependencies> = {}
): CancelInviteDependencies {
  return {
    siteUrl: new URL('https://finance.example'),
    authenticate: async () => ({ id: '00000000-0000-4000-8000-000000000001' }),
    cancel: async () => ({
      status: 'cancelled',
      invite_id: '00000000-0000-4000-8000-000000000002',
    }),
    ...overrides,
  };
}

Deno.test('cancel-invite requires authentication and a UUID', async () => {
  const unauthorized = await handleCancelInvite(
    request(),
    dependencies({ authenticate: async () => null })
  );
  const invalid = await handleCancelInvite(request('bad-id'), dependencies());
  assert(
    unauthorized.status === 401 && invalid.status === 400,
    'expected stable validation'
  );
});

Deno.test(
  'cancel-invite maps atomic cancellation and idempotent terminal state',
  async () => {
    const cancelled = await handleCancelInvite(request(), dependencies());
    const repeated = await handleCancelInvite(
      request(),
      dependencies({ cancel: async () => ({ status: 'already_cancelled' }) })
    );
    assert(
      cancelled.status === 200 && repeated.status === 200,
      'expected idempotent success'
    );
  }
);

Deno.test(
  'cancel-invite maps authorization without exposing invite details',
  async () => {
    const response = await handleCancelInvite(
      request(),
      dependencies({
        cancel: async () => ({ status: 'forbidden', error_code: 'forbidden' }),
      })
    );
    const body = await response.json();
    assert(
      response.status === 403 && body.status === 'forbidden',
      'expected forbidden'
    );
    assert(!('workspace_id' in body), 'must not expose workspace');
  }
);
