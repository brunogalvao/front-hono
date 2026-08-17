import {
  handlePrepareInviteAuth,
  type PrepareInviteAuthDependencies,
} from './index.ts';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function post(token = 'a'.repeat(64)): Request {
  return new Request(
    'https://finance.example/functions/v1/prepare-invite-auth',
    {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        origin: 'https://finance.example',
        'x-forwarded-for': '203.0.113.10',
      },
      body: new URLSearchParams({ token }),
    }
  );
}

function dependencies(
  overrides: Partial<PrepareInviteAuthDependencies> = {}
): PrepareInviteAuthDependencies {
  return {
    siteUrl: new URL('https://finance.example'),
    prepare: async () => ({
      status: 'ready',
      email_normalized: 'person@example.com',
    }),
    generateMagicLink: async (email) => {
      assert(
        email === 'person@example.com',
        'expected server-derived recipient'
      );
      return new URL('https://project.supabase.co/auth/v1/verify?token=opaque');
    },
    ...overrides,
  };
}

Deno.test('prepare-invite-auth requires explicit POST', async () => {
  const response = await handlePrepareInviteAuth(
    new Request('https://finance.example/functions/v1/prepare-invite-auth'),
    dependencies()
  );
  assert(response.status === 405, 'expected method rejection');
});

Deno.test(
  'prepare-invite-auth returns 303 only to generated Supabase link',
  async () => {
    const response = await handlePrepareInviteAuth(post(), dependencies());
    assert(response.status === 303, 'expected See Other');
    assert(
      response.headers
        .get('location')
        ?.startsWith('https://project.supabase.co/auth/v1/verify'),
      'expected auth URL'
    );
  }
);

Deno.test(
  'prepare-invite-auth keeps terminal states non-enumerable',
  async () => {
    const response = await handlePrepareInviteAuth(
      post(),
      dependencies({
        prepare: async () => ({
          status: 'invalid',
          error_code: 'invalid_invite',
        }),
      })
    );
    const body = await response.json();
    assert(response.status === 400, 'expected invalid response');
    assert(
      body.status === 'invalid' && !('email' in body),
      'must not reveal recipient'
    );
  }
);

Deno.test(
  'prepare-invite-auth exposes stable rate limit and Retry-After',
  async () => {
    const response = await handlePrepareInviteAuth(
      post(),
      dependencies({
        prepare: async () => ({
          status: 'rate_limited',
          error_code: 'rate_limited',
          retry_after: 75,
        }),
      })
    );
    assert(response.status === 429, 'expected rate limit');
    assert(
      response.headers.get('retry-after') === '75',
      'expected Retry-After'
    );
  }
);
