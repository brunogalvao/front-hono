import { inviteDeliveryKey, renderInviteEmail } from './email.ts';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

for (const locale of ['pt-BR', 'en'] as const) {
  Deno.test(`renders complete ${locale} invitation email`, () => {
    const rendered = renderInviteEmail({
      locale,
      workspaceName: 'Casa & Família',
      inviterName: 'Ana <Admin>',
      role: 'operador',
      expiresAt: new Date('2026-08-18T12:00:00.000Z'),
      landingUrl: new URL(`https://finance.example/auth/workspace-invite?token=${'a'.repeat(64)}`),
    });

    assert(rendered.html.includes('Casa &amp; Família'), 'expected escaped workspace name');
    assert(rendered.html.includes('Ana &lt;Admin&gt;'), 'expected escaped inviter name');
    assert(rendered.html.includes('min-height: 44px'), 'expected accessible CTA target');
    assert(rendered.text.includes('https://finance.example/auth/workspace-invite'), 'expected textual fallback');
    assert(!rendered.subject.includes('account'), 'must not expose account existence');
  });
}

Deno.test('builds stable Resend idempotency key', () => {
  assert(
    inviteDeliveryKey('00000000-0000-4000-8000-000000000002', 3) ===
      'workspace-invite/00000000-0000-4000-8000-000000000002/3',
    'expected stable idempotency key',
  );
});
