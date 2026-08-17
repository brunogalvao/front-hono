import postgres from 'npm:postgres@3.4.7';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function randomToken(): string {
  return [...crypto.getRandomValues(new Uint8Array(32))]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

Deno.test(
  'twenty real connections accept exactly once without partial state',
  async () => {
    const databaseUrl = Deno.env.get('SUPABASE_DB_URL');
    if (!databaseUrl) throw new Error('SUPABASE_DB_URL is required');

    const setup = postgres(databaseUrl, { max: 1 });
    const actorId = crypto.randomUUID();
    const guestId = crypto.randomUUID();
    const actorEmail = `actor-${actorId}@example.test`;
    const guestEmail = `guest-${guestId}@example.test`;
    const token = randomToken();
    let workspaceId: string | null = null;

    try {
      await setup`
      insert into auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
      ) values (
        '00000000-0000-0000-0000-000000000000', ${actorId}, 'authenticated',
        'authenticated', ${actorEmail}, '', now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"full_name":"Concurrency Admin"}'::jsonb, now(), now()
      )
    `;
      const [workspace] = await setup<{ id: string }[]>`
      select id from public.workspaces where superuser_id = ${actorId}
    `;
      assert(workspace, 'expected actor workspace');
      workspaceId = workspace.id;

      await setup`
      insert into public.workspace_invites (
        workspace_id, invited_by, email_normalized, role, token_hash,
        status, delivery_status, locale, sent_at, expires_at
      ) values (
        ${workspace.id}, ${actorId}, ${guestEmail}, 'operador',
        private.hash_invite_token(${token}), 'pending', 'sent', 'pt-BR',
        now(), now() + interval '24 hours'
      )
    `;
      await setup`
      insert into auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
      ) values (
        '00000000-0000-0000-0000-000000000000', ${guestId}, 'authenticated',
        'authenticated', ${guestEmail}, '', now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{}'::jsonb, now(), now()
      )
    `;

      const clients = Array.from({ length: 20 }, () =>
        postgres(databaseUrl, { max: 1 })
      );
      try {
        const results = await Promise.all(
          clients.map(async (client) => {
            const [row] = await client<{ result: { status: string } }[]>`
            select private.accept_workspace_invite_core(${token}, ${guestId}::uuid) as result
          `;
            return row.result.status;
          })
        );
        assert(
          results.filter((status) => status === 'accepted').length === 1,
          'expected one accepted result'
        );
        assert(
          results.filter((status) => status === 'already_accepted').length ===
            19,
          'expected nineteen terminal results'
        );

        const [invariants] = await setup<
          { memberships: number; accepted: number }[]
        >`
        select
          (select count(*)::integer from public.workspace_members
            where workspace_id = ${workspace.id} and user_id = ${guestId}) as memberships,
          (select count(*)::integer from public.workspace_invites
            where workspace_id = ${workspace.id} and accepted_by = ${guestId} and status = 'accepted') as accepted
      `;
        assert(
          invariants.memberships === 1 && invariants.accepted === 1,
          'expected atomic persisted state'
        );
      } finally {
        await Promise.all(clients.map((client) => client.end()));
      }
    } finally {
      if (workspaceId)
        await setup`delete from public.workspaces where id = ${workspaceId}`;
      await setup`delete from auth.users where id in (${actorId}, ${guestId})`;
      await setup.end();
    }
  }
);
