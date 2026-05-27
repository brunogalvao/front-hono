type WorkspaceRole = 'administrador' | 'operador' | 'visualizador';

export function canWrite(role: WorkspaceRole | null | undefined): boolean {
  return role === 'administrador' || role === 'operador';
}

export function canEditTransaction(
  role: WorkspaceRole | null | undefined,
  transactionCreatedBy: string,
  currentUserId: string,
): boolean {
  if (role === 'administrador') return true;
  if (role === 'operador') return transactionCreatedBy === currentUserId;
  return false;
}

export function canManageMembers(role: WorkspaceRole | null | undefined): boolean {
  return role === 'administrador';
}

export function canManageCategories(role: WorkspaceRole | null | undefined): boolean {
  return role === 'administrador';
}

export function isSuperuser(
  workspaceSuperuserId: string,
  currentUserId: string,
): boolean {
  return workspaceSuperuserId === currentUserId;
}
