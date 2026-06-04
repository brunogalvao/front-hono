import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';
import { isSuperuser } from '@/lib/permissions';
import { useWorkspace } from '@/context/WorkspaceContext';
import type { PermissionResource, ResourcePermission, PermissionMatrix } from '@/lib/permissions';

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

const ALL_RESOURCES: PermissionResource[] = [
  'transactions', 'installments', 'recurring',
  'categories', 'settings', 'members', 'permissions',
];

function buildDenyMatrix(): PermissionMatrix {
  return Object.fromEntries(ALL_RESOURCES.map((r) => [r, { ...DENY_ALL }])) as PermissionMatrix;
}

function buildAllowMatrix(): PermissionMatrix {
  return Object.fromEntries(ALL_RESOURCES.map((r) => [r, { ...ALLOW_ALL }])) as PermissionMatrix;
}

export function usePermissions() {
  const { activeWorkspace, activeRole } = useWorkspace();

  const { data: currentUserId } = useQuery({
    queryKey: queryKeys.auth.session,
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user?.id ?? null;
    },
    staleTime: 10 * 60 * 1000,
  });

  const isSuperAdmin = !!(
    activeWorkspace && currentUserId && isSuperuser(activeWorkspace.superuser_id, currentUserId)
  );

  const { data: matrix, isLoading } = useQuery({
    queryKey: queryKeys.permissions.current(
      activeWorkspace?.id ?? '',
      currentUserId ?? '',
    ),
    enabled: !!activeWorkspace && !!currentUserId && !isSuperAdmin,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<PermissionMatrix> => {
      if (!activeWorkspace || !currentUserId) return buildDenyMatrix();

      // 1. Fetch individual overrides
      const { data: overrides } = await supabase
        .from('workspace_member_permissions')
        .select('*')
        .eq('workspace_id', activeWorkspace.id)
        .eq('user_id', currentUserId);

      // 2. Fetch role-based permissions
      const { data: rolePerms } = await supabase
        .from('workspace_role_permissions')
        .select('*')
        .eq('workspace_id', activeWorkspace.id)
        .eq('role', activeRole ?? '');

      const result = buildDenyMatrix();

      // Apply role permissions first
      for (const perm of rolePerms ?? []) {
        result[perm.resource as PermissionResource] = {
          can_read: perm.can_read,
          can_create: perm.can_create,
          can_update: perm.can_update,
          can_delete: perm.can_delete,
        };
      }

      // Override with individual member permissions (higher precedence)
      for (const override of overrides ?? []) {
        result[override.resource as PermissionResource] = {
          can_read: override.can_read,
          can_create: override.can_create,
          can_update: override.can_update,
          can_delete: override.can_delete,
        };
      }

      return result;
    },
  });

  const effectiveMatrix: PermissionMatrix = isSuperAdmin
    ? buildAllowMatrix()
    : (matrix ?? buildDenyMatrix());

  function getPermission(resource: PermissionResource): ResourcePermission {
    return effectiveMatrix[resource] ?? { ...DENY_ALL };
  }

  function can(resource: PermissionResource, action: 'read' | 'create' | 'update' | 'delete'): boolean {
    if (isSuperAdmin) return true;
    const perm = effectiveMatrix[resource];
    if (!perm) return false;
    return perm[`can_${action}`];
  }

  return {
    getPermission,
    can,
    matrix: effectiveMatrix,
    isSuperAdmin,
    isLoading: !isSuperAdmin && isLoading,
  };
}
