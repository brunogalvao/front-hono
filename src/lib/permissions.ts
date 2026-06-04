export type WorkspaceRole = 'super_administrador' | 'administrador' | 'operador' | 'visualizador';

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

export function canWrite(role: WorkspaceRole | null | undefined): boolean {
  return role === 'super_administrador' || role === 'administrador' || role === 'operador';
}

export function canManageMembers(role: WorkspaceRole | null | undefined): boolean {
  return role === 'super_administrador' || role === 'administrador';
}

export function canManageCategories(role: WorkspaceRole | null | undefined): boolean {
  return role === 'super_administrador' || role === 'administrador';
}

export function isSuperuser(
  workspaceSuperuserId: string,
  currentUserId: string,
): boolean {
  return workspaceSuperuserId === currentUserId;
}
