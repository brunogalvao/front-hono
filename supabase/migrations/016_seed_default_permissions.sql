-- Seed default permission matrix for all existing workspaces
-- Run after 015_workspace_role_permissions.sql

INSERT INTO workspace_role_permissions (workspace_id, role, resource, can_read, can_create, can_update, can_delete)
SELECT
  w.id,
  p.role,
  p.resource,
  p.can_read,
  p.can_create,
  p.can_update,
  p.can_delete
FROM workspaces w
CROSS JOIN (VALUES
  -- administrador: full CRUD on data screens, members; no permissions management
  ('administrador', 'transactions',  true,  true,  true,  true),
  ('administrador', 'installments',  true,  true,  true,  true),
  ('administrador', 'recurring',     true,  true,  true,  true),
  ('administrador', 'categories',    true,  true,  true,  true),
  ('administrador', 'settings',      true,  true,  true,  true),
  ('administrador', 'members',       true,  true,  true,  true),
  ('administrador', 'permissions',   false, false, false, false),

  -- operador: full CRUD on data screens; read-only categories; no settings/members/permissions
  ('operador', 'transactions',  true,  true,  true,  true),
  ('operador', 'installments',  true,  true,  true,  true),
  ('operador', 'recurring',     true,  true,  true,  true),
  ('operador', 'categories',    true,  false, false, false),
  ('operador', 'settings',      false, false, false, false),
  ('operador', 'members',       false, false, false, false),
  ('operador', 'permissions',   false, false, false, false),

  -- visualizador: read-only on data screens; no access to settings/members/permissions
  ('visualizador', 'transactions',  true,  false, false, false),
  ('visualizador', 'installments',  true,  false, false, false),
  ('visualizador', 'recurring',     true,  false, false, false),
  ('visualizador', 'categories',    true,  false, false, false),
  ('visualizador', 'settings',      false, false, false, false),
  ('visualizador', 'members',       false, false, false, false),
  ('visualizador', 'permissions',   false, false, false, false)
) AS p(role, resource, can_read, can_create, can_update, can_delete)
ON CONFLICT (workspace_id, role, resource) DO NOTHING;
