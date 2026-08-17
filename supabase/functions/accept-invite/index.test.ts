import { handleAcceptInvite, type AcceptInviteDependencies } from './index.ts';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function request(
  operation: 'preview' | 'accept',
  token = 'a'.repeat(64),
  authorization = 'Bearer session'
): Request {
  return new Request('https://finance.example/functions/v1/accept-invite', {
    method: 'POST',
    headers: {
      authorization,
      'content-type': 'application/json',
      origin: 'https://finance.example',
    },
    body: JSON.stringify({ operation, token }),
  });
}

function dependencies(
  overrides: Partial<AcceptInviteDependencies> = {}
): AcceptInviteDependencies {
  return {
    siteUrl: new URL('https://finance.example'),
    authenticate: async () => ({ id: '00000000-0000-4000-8000-000000000001' }),
    preview: async () => ({
      status: 'valid',
      workspace: { id: '00000000-0000-4000-8000-000000000002', name: 'Casa' },
      inviter: { display_name: 'Admin' },
      role: 'visualizador',
      expires_at: '2026-08-18T12:00:00.000Z',
      profile_onboarding_status: 'incomplete',
    }),
    accept: async () => ({
      status: 'accepted',
      workspace: { id: '00000000-0000-4000-8000-000000000002', name: 'Casa' },
      role: 'visualizador',
      profile_onboarding_status: 'incomplete',
    }),
    ...overrides,
  };
}

Deno.test('accept-invite requires an authenticated session', async () => {
  const response = await handleAcceptInvite(
    request('preview', 'a'.repeat(64), ''),
    dependencies({ authenticate: async () => null })
  );
  assert(response.status === 401, 'expected 401');
});

Deno.test('accept-invite preview is non-mutating', async () => {
  let accepts = 0;
  const response = await handleAcceptInvite(
    request('preview'),
    dependencies({
      accept: async () => {
        accepts += 1;
        throw new Error('not expected');
      },
    })
  );
  const body = await response.json();
  assert(
    response.status === 200 && body.status === 'valid',
    'expected valid preview'
  );
  assert(accepts === 0, 'preview must not accept');
});

Deno.test('accept-invite accepts only after explicit operation', async () => {
  const response = await handleAcceptInvite(request('accept'), dependencies());
  const body = await response.json();
  assert(
    response.status === 200 && body.status === 'accepted',
    'expected accepted result'
  );
});

Deno.test(
  'accept-invite maps email mismatch without leaking an address',
  async () => {
    const mismatch = {
      status: 'email_mismatch',
      error_code: 'email_mismatch',
    } as const;
    const response = await handleAcceptInvite(
      request('preview'),
      dependencies({ preview: async () => mismatch })
    );
    const body = await response.json();
    assert(
      response.status === 403 && body.status === 'email_mismatch',
      'expected mismatch'
    );
    assert(!JSON.stringify(body).includes('@'), 'must not expose either email');
  }
);
