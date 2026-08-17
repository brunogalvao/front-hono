begin;

create extension if not exists pgtap with schema extensions;
\set include_test_helpers true
\ir test_helpers.sql
\unset include_test_helpers

select plan(8);

create temporary table existing_invite_context (
  actor_id uuid,
  workspace_id uuid,
  existing_id uuid,
  historical_id uuid
) on commit drop;

insert into existing_invite_context (actor_id, existing_id, historical_id)
values (
  tests.create_user('existing-admin@example.test', 'Admin'),
  tests.create_user('existing-member@example.test', 'Existing'),
  tests.create_user('historical-profile@example.test', null)
);

update existing_invite_context context
set workspace_id = workspace.id
from public.workspaces workspace
where workspace.superuser_id = context.actor_id;

insert into public.workspace_members (workspace_id, user_id, role)
select workspace_id, existing_id, 'operador'
from existing_invite_context;

insert into public.workspace_member_permissions (
  workspace_id, user_id, resource, can_read, can_create, can_update, can_delete
)
select workspace_id, existing_id, 'transactions', true, false, true, false
from existing_invite_context;

insert into public.workspace_invites (
  workspace_id, invited_by, email_normalized, role, token_hash,
  status, delivery_status, locale, sent_at, expires_at
)
select workspace_id, actor_id, 'existing-member@example.test', 'visualizador',
  private.hash_invite_token(repeat('d', 64)), 'pending', 'sent', 'pt-BR',
  now(), now() + interval '24 hours'
from existing_invite_context;

select is(
  private.accept_workspace_invite_core(repeat('d', 64), context.existing_id) ->> 'status',
  'already_member',
  'returns already_member for an existing membership'
)
from existing_invite_context context;

select is(
  (select role::text from public.workspace_members
    where workspace_id = context.workspace_id and user_id = context.existing_id),
  'operador',
  'preserves the existing member role'
)
from existing_invite_context context;

select ok(
  (select can_read and can_update and not can_create and not can_delete
    from public.workspace_member_permissions
    where workspace_id = context.workspace_id
      and user_id = context.existing_id
      and resource = 'transactions'),
  'preserves existing individual permission overrides'
)
from existing_invite_context context;

delete from public.workspaces workspace
using existing_invite_context context
where workspace.superuser_id = context.historical_id;
delete from public.profiles profile
using existing_invite_context context
where profile.id = context.historical_id;

insert into public.workspace_invites (
  workspace_id, invited_by, email_normalized, role, token_hash,
  status, delivery_status, locale, sent_at, expires_at
)
select workspace_id, actor_id, 'historical-profile@example.test', 'visualizador',
  private.hash_invite_token(repeat('e', 64)), 'pending', 'sent', 'en',
  now(), now() + interval '24 hours'
from existing_invite_context;

select is(
  private.accept_workspace_invite_core(repeat('e', 64), context.historical_id) ->> 'status',
  'accepted',
  'repairs a historical Auth user without a profile during acceptance'
)
from existing_invite_context context;

select ok(
  exists (
    select 1 from public.profiles profile
    where profile.id = context.historical_id
      and profile.signup_origin = 'workspace_invite'
      and profile.onboarding_status = 'incomplete'
  ),
  'creates only the minimum invited profile during repair'
)
from existing_invite_context context;

select is(
  (select count(*)::integer from public.workspaces where superuser_id = context.historical_id),
  0,
  'historical profile repair does not create a personal workspace'
)
from existing_invite_context context;

select is(
  private.preview_workspace_invite_core(repeat('e', 64), context.existing_id) ->> 'status',
  'email_mismatch',
  'rejects a session with a different canonical email'
)
from existing_invite_context context;

select is(
  (select count(*)::integer from public.workspace_members
    where workspace_id = context.workspace_id and user_id = context.existing_id),
  1,
  'email mismatch introduces no additional membership mutation'
)
from existing_invite_context context;

select * from finish();
rollback;
