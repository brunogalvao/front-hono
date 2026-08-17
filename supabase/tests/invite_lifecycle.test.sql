begin;

create extension if not exists pgtap with schema extensions;
\set include_test_helpers true
\ir test_helpers.sql
\unset include_test_helpers

select plan(11);

create temporary table lifecycle_context (
  actor_id uuid,
  guest_id uuid,
  workspace_id uuid,
  invite_id uuid,
  old_token text,
  new_token text,
  delivery_version integer
) on commit drop;

insert into lifecycle_context (actor_id)
values (tests.create_user('lifecycle-admin@example.test', 'Lifecycle Admin'));

update lifecycle_context context
set workspace_id = workspace.id
from public.workspaces workspace
where workspace.superuser_id = context.actor_id;

update lifecycle_context context
set (invite_id, old_token, delivery_version) = (
  select result.invite_id, result.raw_token, result.delivery_version
  from private.rotate_workspace_invite_core(
    'create', context.actor_id, context.workspace_id, null,
    'lifecycle-guest@example.test', 'operador', 'pt-BR', '198.51.100.10',
    20, 20, 20
  ) result
);

update lifecycle_context
set guest_id = tests.create_user('lifecycle-guest@example.test', null);

select ok(invite_id is not null and length(old_token) = 64, 'creates an opaque versioned invitation')
from lifecycle_context;

select isnt(
  (select token_hash from public.workspace_invites where id = context.invite_id),
  context.old_token,
  'never persists the raw token'
)
from lifecycle_context context;

do $$
declare context lifecycle_context%rowtype;
begin
  select * into context from lifecycle_context;
  perform private.record_workspace_invite_delivery_core(
    context.invite_id, context.delivery_version, false, null, 'provider_unavailable'
  );
end
$$;

select is(
  (select delivery_status::text from public.workspace_invites where id = context.invite_id),
  'failed',
  'persists a failed delivery without a validity period'
)
from lifecycle_context context;

update lifecycle_context context
set (new_token, delivery_version) = (
  select result.raw_token, result.delivery_version
  from private.rotate_workspace_invite_core(
    'resend', context.actor_id, context.workspace_id, context.invite_id,
    null, null, 'en', '198.51.100.10', 20, 20, 20
  ) result
);

select ok(
  new_token <> old_token and delivery_version = 2,
  'resend rotates the token and increments its delivery version'
)
from lifecycle_context;

select is(
  private.preview_workspace_invite_core(context.old_token, context.actor_id) ->> 'status',
  'invalid',
  'the previous token stops resolving immediately after rotation'
)
from lifecycle_context context;

do $$
declare context lifecycle_context%rowtype;
begin
  select * into context from lifecycle_context;
  perform private.record_workspace_invite_delivery_core(
    context.invite_id, context.delivery_version, true, 'provider-message-2', null
  );
end
$$;

select ok(
  exists (
    select 1 from public.workspace_invites invite
    where invite.id = context.invite_id
      and invite.delivery_status = 'sent'
      and invite.expires_at = invite.sent_at + interval '24 hours'
  ),
  'successful resend starts a fresh authoritative 24-hour period'
)
from lifecycle_context context;

select is(
  private.cancel_workspace_invite_core(context.invite_id, context.actor_id) ->> 'status',
  'cancelled',
  'authorized administrator can cancel a pending invitation atomically'
)
from lifecycle_context context;

select is(
  private.cancel_workspace_invite_core(context.invite_id, context.actor_id) ->> 'status',
  'already_cancelled',
  'cancellation is idempotent for the terminal state'
)
from lifecycle_context context;

select is(
  private.preview_workspace_invite_core(context.new_token, context.guest_id) ->> 'status',
  'cancelled',
  'cancelled token resolves only to its terminal public state'
)
from lifecycle_context context;

select is(
  has_table_privilege('authenticated', 'private.workspace_invite_attempts', 'select'),
  false,
  'durable attempt ledger remains private'
);

select is(
  (
    select result_status
    from private.rotate_workspace_invite_core(
      'create', context.actor_id, context.workspace_id, null,
      'limited@example.test', 'visualizador', 'pt-BR', '203.0.113.20',
      1, 1, 1
    )
  ),
  'rate_limited',
  'rate limiter returns a stable state before account enumeration'
)
from lifecycle_context context;

select * from finish();
rollback;
