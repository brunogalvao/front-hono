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
import type { PlanTier } from '@/model/user.model';

interface UserAccessProfile {
  plan_tier: PlanTier;
  is_platform_superuser: boolean;
  max_workspaces: number;
}

export function usePermissions() {
  const { activeWorkspace, activeRole } = useWorkspace();

  const { data: currentUserId, isLoading: isCurrentUserLoading } = useQuery({
    queryKey: queryKeys.auth.session,
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user?.id ?? null;
    },
    staleTime: 10 * 60 * 1000,
  });

  const { data: accessProfile, isLoading: isProfileLoading } = useQuery({
    queryKey: [...queryKeys.user.profile, 'access', currentUserId ?? ''],
    enabled: !!currentUserId,
    staleTime: 30_000,
    queryFn: async (): Promise<UserAccessProfile | null> => {
      if (!currentUserId) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('plan_tier, is_platform_superuser, max_workspaces')
        .eq('id', currentUserId)
        .maybeSingle();
      if (error || !data) return null;
      return {
        plan_tier: (data.plan_tier === 'pro' ? 'pro' : 'free') as PlanTier,
        is_platform_superuser: Boolean(data.is_platform_superuser),
        max_workspaces:
          typeof data.max_workspaces === 'number' ? data.max_workspaces : 1,
      };
    },
  });

  const isWorkspaceOwner = !!(
    activeWorkspace &&
    currentUserId &&
    isSuperuser(activeWorkspace.superuser_id, currentUserId)
  );

  const isSuperAdmin = Boolean(accessProfile?.is_platform_superuser);
  const planTier: PlanTier = isSuperAdmin
    ? 'pro'
    : (accessProfile?.plan_tier ?? 'free');
  const maxWorkspaces = isSuperAdmin
    ? Math.max(accessProfile?.max_workspaces ?? 100, 100)
    : (accessProfile?.max_workspaces ?? (planTier === 'pro' ? 20 : 1));

  const { data: matrix, isLoading } = useQuery({
    queryKey: queryKeys.permissions.current(
      activeWorkspace?.id ?? '',
      currentUserId ?? '',
      activeRole ?? undefined
    ),
    enabled:
      !!activeWorkspace &&
      !!currentUserId &&
      !isProfileLoading &&
      !isSuperAdmin,
    staleTime: 15_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: 'always',
    queryFn: async (): Promise<PermissionMatrix> => {
      if (!activeWorkspace || !currentUserId) return createPermissionMatrix();

      // 1. Fetch individual overrides
      const { data: overrides, error: overridesError } = await supabase
        .from('workspace_member_permissions')
        .select('*')
        .eq('workspace_id', activeWorkspace.id)
        .eq('user_id', currentUserId);
      if (overridesError) throw overridesError;

      // 2. Fetch role-based permissions
      const { data: rolePerms, error: rolePermissionsError } = await supabase
        .from('workspace_role_permissions')
        .select('*')
        .eq('workspace_id', activeWorkspace.id)
        .eq('role', activeRole ?? '');
      if (rolePermissionsError) throw rolePermissionsError;

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
    currentUserId,
    isSuperAdmin,
    isWorkspaceOwner,
    planTier,
    maxWorkspaces,
    isLoading:
      isCurrentUserLoading ||
      isProfileLoading ||
      (!isSuperAdmin && isLoading),
  };
}
