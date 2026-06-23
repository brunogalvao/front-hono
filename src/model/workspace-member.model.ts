import type { WorkspaceRole, PermissionResource } from '@/model/workspace.model';

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  created_at: string;
  profiles?: { id: string; full_name: string | null; email: string; avatar_url: string | null } | null;
}

export interface PendingInvite {
  id: string;
  email: string;
  role: WorkspaceRole;
  expires_at: string;
  created_at: string;
}

export interface MemberPermission {
  id: string;
  workspace_id: string;
  user_id: string;
  resource: PermissionResource;
  can_read: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
}

export interface RolePermission {
  id: string;
  workspace_id: string;
  role: 'administrador' | 'operador' | 'visualizador';
  resource: PermissionResource;
  can_read: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
}
