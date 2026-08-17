begin;

create extension if not exists pgtap with schema extensions;
\set include_test_helpers true
\ir test_helpers.sql
\unset include_test_helpers

select plan(6);

create temporary table precedence_context (
  workspace_id uuid,
  superuser_id uuid,
  member_id uuid
) on commit drop;

insert into precedence_context (superuser_id, member_id)
values (
  tests.create_user('precedence-superuser@example.test', 'Superuser'),
  tests.create_user('precedence-member@example.test', 'Member')
);

update precedence_context context
set workspace_id = workspace.id
from public.workspaces workspace
where workspace.superuser_id = context.superuser_id;

insert into public.workspace_members (workspace_id, user_id, role)
select workspace_id, member_id, 'operador' from precedence_context;

select ok(
  private.has_workspace_permission(context.workspace_id, 'transactions', 'create', context.member_id),
  'role permission is used when no override exists'
)
from precedence_context context;

insert into public.workspace_member_permissions (
  workspace_id, user_id, resource, can_read, can_create, can_update, can_delete
)
select workspace_id, member_id, 'transactions', true, false, false, false
from precedence_context;

select is(
  private.has_workspace_permission(context.workspace_id, 'transactions', 'create', context.member_id),
  false,
  'explicit deny override takes precedence over role allow'
)
from precedence_context context;

select ok(
  private.has_workspace_permission(context.workspace_id, 'transactions', 'read', context.member_id),
  'explicit allow override is effective'
)
from precedence_context context;

delete from public.workspace_member_permissions permission
using precedence_context context
where permission.workspace_id = context.workspace_id
  and permission.user_id = context.member_id
  and permission.resource = 'transactions';

select ok(
  private.has_workspace_permission(context.workspace_id, 'transactions', 'update', context.member_id),
  'deleting an override restores role fallback'
)
from precedence_context context;

delete from public.workspace_role_permissions permission
using precedence_context context
where permission.workspace_id = context.workspace_id
  and permission.role = 'operador'
  and permission.resource = 'transactions';

select is(
  private.has_workspace_permission(context.workspace_id, 'transactions', 'read', context.member_id),
  false,
  'missing override and role rows deny by default'
)
from precedence_context context;

select ok(
  private.has_workspace_permission(context.workspace_id, 'transactions', 'delete', context.superuser_id),
  'superuser remains allowed when the matrix row is absent'
)
from precedence_context context;

select * from finish();
rollback;
