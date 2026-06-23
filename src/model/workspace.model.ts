export type WorkspaceRole =
  | 'super_administrador'
  | 'administrador'
  | 'operador'
  | 'visualizador';

export interface WorkspaceInfo {
  id: string;
  name: string;
  role: WorkspaceRole;
  superuser_id: string;
}

export type PermissionResource =
  | 'transactions'
  | 'installments'
  | 'recurring'
  | 'categories'
  | 'settings'
  | 'members'
  | 'permissions';

export interface ResourcePermission {
  can_read: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
}

export type PermissionMatrix = Record<PermissionResource, ResourcePermission>;
