begin;

create extension if not exists pgtap with schema extensions;
\set include_test_helpers true
\ir test_helpers.sql
\unset include_test_helpers

select plan(17);

select is(
  private.normalize_email('  Person@Example.COM  '),
  'person@example.com',
  'normalizes email with trim and lowercase'
);

select ok(
  private.hash_invite_token(repeat('a', 64)) <> repeat('a', 64),
  'hashes invitation tokens before persistence'
);

select hasnt_column(
  'public',
  'workspace_invites',
  'token',
  'does not retain the plaintext token column'
);

create temporary table invite_test_context (
  actor_id uuid,
  workspace_id uuid,
  guest_id uuid,
  invite_id uuid
) on commit drop;

insert into invite_test_context (actor_id)
values (tests.create_user(' Admin@Example.com ', 'Admin Test'));

update invite_test_context context
set workspace_id = workspace.id
from public.workspaces workspace
where workspace.superuser_id = context.actor_id;

with created_invite as (
  insert into public.workspace_invites (
    workspace_id,
    invited_by,
    email_normalized,
    role,
    token_hash,
    status,
    delivery_status,
    locale
  )
  select
    workspace_id,
    actor_id,
    'guest@example.com',
    'visualizador',
    private.hash_invite_token(repeat('b', 64)),
    'pending',
    'pending',
    'pt-BR'
  from invite_test_context
  returning id
)
update invite_test_context
set invite_id = (select id from created_invite);

select is(
  (select length(token_hash) from public.workspace_invites where id = context.invite_id),
  64,
  'persists a fixed-length SHA-256 token hash'
)
from invite_test_context context;

update invite_test_context
set guest_id = tests.create_user(' Guest@Example.COM ', null);

select is(
  (select email_normalized from public.profiles where id = context.guest_id),
  'guest@example.com',
  'persists canonical profile email'
)
from invite_test_context context;

select is(
  (select signup_origin::text from public.profiles where id = context.guest_id),
  'workspace_invite',
  'marks profile as originating from an invitation'
)
from invite_test_context context;

select is(
  (select onboarding_status::text from public.profiles where id = context.guest_id),
  'incomplete',
  'creates an incomplete invited profile'
)
from invite_test_context context;

select is(
  (select count(*)::integer from public.workspace_members where user_id = context.guest_id),
  0,
  'does not create a personal workspace membership for invited identities'
)
from invite_test_context context;

select is(
  (select count(*)::integer from public.workspaces where superuser_id = context.guest_id),
  0,
  'does not create a personal workspace for invited identities'
)
from invite_test_context context;

select throws_ok(
  format(
    $sql$
      insert into public.workspace_invites (
        workspace_id, invited_by, email_normalized, role, token_hash,
        status, delivery_status, locale
      ) values (%L, %L, 'guest@example.com', 'operador', %L,
        'pending', 'pending', 'en')
    $sql$,
    (select workspace_id from invite_test_context),
    (select actor_id from invite_test_context),
    private.hash_invite_token(repeat('c', 64))
  ),
  '23505',
  null,
  'allows at most one pending invitation per normalized email and workspace'
);

update public.workspace_invites invite
set
  delivery_status = 'sent',
  sent_at = now(),
  expires_at = now() + interval '24 hours'
from invite_test_context context
where invite.id = context.invite_id;

select is(
  private.preview_workspace_invite_core(repeat('b', 64), context.guest_id) ->> 'status',
  'valid',
  'previews a delivered invitation without consuming it'
)
from invite_test_context context;

select is(
  (select status::text from public.workspace_invites where id = context.invite_id),
  'pending',
  'preview leaves invitation pending'
)
from invite_test_context context;

select is(
  private.accept_workspace_invite_core(repeat('b', 64), context.guest_id) ->> 'status',
  'accepted',
  'accepts a matching invitation atomically'
)
from invite_test_context context;

select is(
  (select role::text from public.workspace_members
    where workspace_id = context.workspace_id and user_id = context.guest_id),
  'visualizador',
  'creates membership with the invited role'
)
from invite_test_context context;

select ok(
  exists (
    select 1 from public.workspace_invites invite
    where invite.id = context.invite_id
      and invite.status = 'accepted'
      and invite.accepted_by = context.guest_id
      and invite.accepted_at is not null
  ),
  'persists accepted terminal state and actor together'
)
from invite_test_context context;

select is(
  private.accept_workspace_invite_core(repeat('b', 64), context.guest_id) ->> 'status',
  'already_accepted',
  'does not consume the same token twice'
)
from invite_test_context context;

select is(
  (select count(*)::integer from public.workspace_members
    where workspace_id = context.workspace_id and user_id = context.guest_id),
  1,
  'keeps exactly one membership after repeated acceptance'
)
from invite_test_context context;

select * from finish();
rollback;
