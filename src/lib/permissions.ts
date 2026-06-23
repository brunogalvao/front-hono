import type { WorkspaceRole, PermissionResource, ResourcePermission, PermissionMatrix } from '@/model/workspace.model';

export type { WorkspaceRole, PermissionResource, ResourcePermission, PermissionMatrix };

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
