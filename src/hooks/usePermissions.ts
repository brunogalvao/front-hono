import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';
import {
  createPermissionMatrix,
  isSuperuser,
  resolvePermissionMatrix,
} from '@/lib/permissions';
import { useWorkspace } from '@/context/WorkspaceContext';
import type {
  PermissionResource,
  ResourcePermission,
  PermissionMatrix,
} from '@/lib/permissions';

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
    activeWorkspace &&
    currentUserId &&
    isSuperuser(activeWorkspace.superuser_id, currentUserId)
  );

  const { data: matrix, isLoading } = useQuery({
    queryKey: queryKeys.permissions.current(
      activeWorkspace?.id ?? '',
      currentUserId ?? ''
    ),
    enabled: !!activeWorkspace && !!currentUserId && !isSuperAdmin,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<PermissionMatrix> => {
      if (!activeWorkspace || !currentUserId) return createPermissionMatrix();

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

      return resolvePermissionMatrix(rolePerms, overrides);
    },
  });

  const effectiveMatrix: PermissionMatrix = isSuperAdmin
    ? createPermissionMatrix(true)
    : (matrix ?? createPermissionMatrix());

  function getPermission(resource: PermissionResource): ResourcePermission {
    return (
      effectiveMatrix[resource] ?? {
        can_read: false,
        can_create: false,
        can_update: false,
        can_delete: false,
      }
    );
  }

  function can(
    resource: PermissionResource,
    action: 'read' | 'create' | 'update' | 'delete'
  ): boolean {
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
