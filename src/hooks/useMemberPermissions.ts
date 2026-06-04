import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';
import type { PermissionResource } from '@/lib/permissions';

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

export function useMemberPermissions(workspaceId: string | null, userId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.permissions.memberOverrides(workspaceId ?? '', userId ?? ''),
    enabled: !!workspaceId && !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workspace_member_permissions')
        .select('*')
        .eq('workspace_id', workspaceId!)
        .eq('user_id', userId!);
      if (error) throw error;
      return (data ?? []) as MemberPermission[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const upsert = useMutation({
    mutationFn: async (permission: Omit<MemberPermission, 'id'> & { updated_by: string }) => {
      const { error } = await supabase
        .from('workspace_member_permissions')
        .upsert(permission, { onConflict: 'workspace_id,user_id,resource' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.permissions.memberOverrides(workspaceId ?? '', userId ?? ''),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.current(workspaceId ?? '', userId ?? '') });
    },
  });

  const remove = useMutation({
    mutationFn: async (resource: PermissionResource) => {
      const { error } = await supabase
        .from('workspace_member_permissions')
        .delete()
        .eq('workspace_id', workspaceId!)
        .eq('user_id', userId!)
        .eq('resource', resource);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.all });
    },
  });

  const resetAll = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('workspace_member_permissions')
        .delete()
        .eq('workspace_id', workspaceId!)
        .eq('user_id', userId!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.all });
    },
  });

  return { ...query, upsert, remove, resetAll };
}
