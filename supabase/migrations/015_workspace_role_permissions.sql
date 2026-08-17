-- Migration: workspace_role_permissions
-- Stores per-role, per-resource CRUD permission matrix for each workspace

CREATE TABLE IF NOT EXISTS workspace_role_permissions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  role         text NOT NULL CHECK (role IN ('administrador', 'operador', 'visualizador')),
  resource     text NOT NULL CHECK (resource IN (
                 'transactions', 'installments', 'recurring',
                 'categories', 'settings', 'members', 'permissions'
               )),
  can_read     boolean NOT NULL DEFAULT false,
  can_create   boolean NOT NULL DEFAULT false,
  can_update   boolean NOT NULL DEFAULT false,
  can_delete   boolean NOT NULL DEFAULT false,
  updated_at   timestamptz NOT NULL DEFAULT now(),
  updated_by   uuid REFERENCES auth.users(id),

  UNIQUE (workspace_id, role, resource)
);

-- Migration: workspace_member_permissions
-- Individual permission overrides per user per resource (takes precedence over role permissions)

CREATE TABLE IF NOT EXISTS workspace_member_permissions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource     text NOT NULL CHECK (resource IN (
                 'transactions', 'installments', 'recurring',
                 'categories', 'settings', 'members', 'permissions'
               )),
  can_read     boolean NOT NULL DEFAULT false,
  can_create   boolean NOT NULL DEFAULT false,
  can_update   boolean NOT NULL DEFAULT false,
  can_delete   boolean NOT NULL DEFAULT false,
  updated_at   timestamptz NOT NULL DEFAULT now(),
  updated_by   uuid REFERENCES auth.users(id),

  UNIQUE (workspace_id, user_id, resource)
);

-- RLS: workspace_role_permissions

ALTER TABLE workspace_role_permissions ENABLE ROW LEVEL SECURITY;

-- Members can read their own role's permissions
CREATE POLICY "members_read_role_permissions"
  ON workspace_role_permissions FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
    OR
    workspace_id IN (
      SELECT id FROM workspaces WHERE superuser_id = auth.uid()
    )
  );

-- Only the workspace superuser can modify role permissions
CREATE POLICY "superuser_manage_role_permissions"
  ON workspace_role_permissions FOR ALL
  USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE superuser_id = auth.uid()
    )
  );

-- RLS: workspace_member_permissions

ALTER TABLE workspace_member_permissions ENABLE ROW LEVEL SECURITY;

-- Users can read their own overrides; superuser can read all
CREATE POLICY "members_read_own_overrides"
  ON workspace_member_permissions FOR SELECT
  USING (
    user_id = auth.uid()
    OR
    workspace_id IN (
      SELECT id FROM workspaces WHERE superuser_id = auth.uid()
    )
  );

-- Only the workspace superuser can manage individual member overrides
CREATE POLICY "superuser_manage_member_permissions"
  ON workspace_member_permissions FOR ALL
  USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE superuser_id = auth.uid()
    )
  );
