begin;

create extension if not exists pgtap with schema extensions;
\set include_test_helpers true
\ir test_helpers.sql
\unset include_test_helpers

select plan(88);

create temporary table permission_context (
  workspace_id uuid,
  superuser_id uuid,
  administrador_id uuid,
  operador_id uuid,
  visualizador_id uuid
) on commit drop;

insert into permission_context (superuser_id, administrador_id, operador_id, visualizador_id)
values (
  tests.create_user('matrix-superuser@example.test', 'Superuser'),
  tests.create_user('matrix-admin@example.test', 'Admin'),
  tests.create_user('matrix-operator@example.test', 'Operator'),
  tests.create_user('matrix-viewer@example.test', 'Viewer')
);

update permission_context context
set workspace_id = workspace.id
from public.workspaces workspace
where workspace.superuser_id = context.superuser_id;

insert into public.workspace_members (workspace_id, user_id, role)
select workspace_id, administrador_id, 'administrador'::public.workspace_role from permission_context
union all select workspace_id, operador_id, 'operador'::public.workspace_role from permission_context
union all select workspace_id, visualizador_id, 'visualizador'::public.workspace_role from permission_context;

with expected(role, resource, can_read, can_create, can_update, can_delete) as (values
  ('administrador', 'transactions', true, true, true, true),
  ('administrador', 'installments', true, true, true, true),
  ('administrador', 'recurring', true, true, true, true),
  ('administrador', 'categories', true, true, true, true),
  ('administrador', 'settings', true, true, true, true),
  ('administrador', 'members', true, true, true, true),
  ('administrador', 'permissions', false, false, false, false),
  ('operador', 'transactions', true, true, true, true),
  ('operador', 'installments', true, true, true, true),
  ('operador', 'recurring', true, true, true, true),
  ('operador', 'categories', true, false, false, false),
  ('operador', 'settings', false, false, false, false),
  ('operador', 'members', false, false, false, false),
  ('operador', 'permissions', false, false, false, false),
  ('visualizador', 'transactions', true, false, false, false),
  ('visualizador', 'installments', true, false, false, false),
  ('visualizador', 'recurring', true, false, false, false),
  ('visualizador', 'categories', true, false, false, false),
  ('visualizador', 'settings', false, false, false, false),
  ('visualizador', 'members', false, false, false, false),
  ('visualizador', 'permissions', false, false, false, false)
), actors as (
  select workspace_id, 'administrador' role, administrador_id user_id from permission_context
  union all select workspace_id, 'operador', operador_id from permission_context
  union all select workspace_id, 'visualizador', visualizador_id from permission_context
), actions(action) as (values ('read'), ('create'), ('update'), ('delete'))
select is(
  private.has_workspace_permission(actors.workspace_id, expected.resource, actions.action, actors.user_id),
  case actions.action
    when 'read' then expected.can_read
    when 'create' then expected.can_create
    when 'update' then expected.can_update
    when 'delete' then expected.can_delete
  end,
  format('%s %s %s follows the effective matrix', expected.role, expected.resource, actions.action)
)
from expected
join actors using (role)
cross join actions;

select ok(
  private.has_workspace_permission(context.workspace_id, 'permissions', 'delete', context.superuser_id),
  'workspace superuser bypasses the matrix'
)
from permission_context context;

select is(
  private.has_workspace_permission(context.workspace_id, 'transactions', 'read', gen_random_uuid()),
  false,
  'unknown member is denied by default'
)
from permission_context context;

select ok(
  has_table_privilege('authenticated', 'public.workspace_role_permissions', 'select'),
  'authenticated role can read the scoped role matrix through RLS'
);

select ok(
  has_table_privilege('authenticated', 'public.workspace_member_permissions', 'select'),
  'authenticated role can read its scoped overrides through RLS'
);

select * from finish();
rollback;
