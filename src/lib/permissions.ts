import type {
  WorkspaceRole,
  PermissionResource,
  ResourcePermission,
  PermissionMatrix,
} from '@/model/workspace.model';

export type {
  WorkspaceRole,
  PermissionResource,
  ResourcePermission,
  PermissionMatrix,
};

export const PERMISSION_RESOURCES: PermissionResource[] = [
  'transactions',
  'installments',
  'recurring',
  'categories',
  'settings',
  'members',
  'permissions',
];

const DENY_ALL: ResourcePermission = {
  can_read: false,
  can_create: false,
  can_update: false,
  can_delete: false,
};

const ALLOW_ALL: ResourcePermission = {
  can_read: true,
  can_create: true,
  can_update: true,
  can_delete: true,
};

export type PermissionRow = ResourcePermission & { resource: string };

export function createPermissionMatrix(allowAll = false): PermissionMatrix {
  const fallback = allowAll ? ALLOW_ALL : DENY_ALL;
  return Object.fromEntries(
    PERMISSION_RESOURCES.map((resource) => [resource, { ...fallback }])
  ) as PermissionMatrix;
}

export function resolvePermissionMatrix(
  rolePermissions: PermissionRow[] | null | undefined,
  memberOverrides: PermissionRow[] | null | undefined,
  superuser = false
): PermissionMatrix {
  if (superuser) return createPermissionMatrix(true);
  const matrix = createPermissionMatrix();

  for (const permission of rolePermissions ?? []) {
    if (
      !PERMISSION_RESOURCES.includes(permission.resource as PermissionResource)
    )
      continue;
    matrix[permission.resource as PermissionResource] = {
      can_read: permission.can_read,
      can_create: permission.can_create,
      can_update: permission.can_update,
      can_delete: permission.can_delete,
    };
  }
  for (const override of memberOverrides ?? []) {
    if (!PERMISSION_RESOURCES.includes(override.resource as PermissionResource))
      continue;
    matrix[override.resource as PermissionResource] = {
      can_read: override.can_read,
      can_create: override.can_create,
      can_update: override.can_update,
      can_delete: override.can_delete,
    };
  }
  return matrix;
}

export function canWrite(role: WorkspaceRole | null | undefined): boolean {
  return (
    role === 'super_administrador' ||
    role === 'administrador' ||
    role === 'operador'
  );
}

export function canManageMembers(
  role: WorkspaceRole | null | undefined
): boolean {
  return role === 'super_administrador' || role === 'administrador';
}

export function canManageCategories(
  role: WorkspaceRole | null | undefined
): boolean {
  return role === 'super_administrador' || role === 'administrador';
}

export function isSuperuser(
  workspaceSuperuserId: string,
  currentUserId: string
): boolean {
  return workspaceSuperuserId === currentUserId;
}
