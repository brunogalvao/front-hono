import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';
import type { PermissionResource } from '@/lib/permissions';

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

export function useRolePermissions(workspaceId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.permissions.roleMatrix(workspaceId ?? ''),
    enabled: !!workspaceId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workspace_role_permissions')
        .select('*')
        .eq('workspace_id', workspaceId!);
      if (error) throw error;
      return (data ?? []) as RolePermission[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const upsert = useMutation({
    mutationFn: async (permission: Omit<RolePermission, 'id'> & { updated_by: string }) => {
      const { error } = await supabase
        .from('workspace_role_permissions')
        .upsert(permission, { onConflict: 'workspace_id,role,resource' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.all });
    },
  });

  return { ...query, upsert };
}
