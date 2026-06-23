import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';
import type { WorkspaceMember, PendingInvite } from '@/model/workspace-member.model';
import type { WorkspaceRole } from '@/model/workspace.model';

export type { WorkspaceMember, PendingInvite };

async function fetchMembers(workspaceId: string): Promise<WorkspaceMember[]> {
  const { data, error } = await supabase
    .from('workspace_members')
    .select('*, profiles(id, full_name, email, avatar_url)')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as WorkspaceMember[];
}

async function fetchPendingInvites(workspaceId: string): Promise<PendingInvite[]> {
  const { data, error } = await supabase
    .from('workspace_invites')
    .select('id, email, role, expires_at, created_at')
    .eq('workspace_id', workspaceId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as PendingInvite[];
}

export function useWorkspaceMembers(workspaceId: string | null) {
  const queryClient = useQueryClient();

  const members = useQuery({
    queryKey: queryKeys.workspaces.members(workspaceId ?? ''),
    queryFn: () => fetchMembers(workspaceId!),
    enabled: !!workspaceId,
  });

  const pendingInvites = useQuery({
    queryKey: queryKeys.workspaces.pendingInvites(workspaceId ?? ''),
    queryFn: () => fetchPendingInvites(workspaceId!),
    enabled: !!workspaceId,
  });

  const updateRole = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: WorkspaceRole }) => {
      const { error } = await supabase
        .from('workspace_members')
        .update({ role })
        .eq('id', memberId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.members(workspaceId ?? '') });
    },
  });

  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase.from('workspace_members').delete().eq('id', memberId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.members(workspaceId ?? '') });
    },
  });

  const inviteMember = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: WorkspaceRole }) => {
      const { data, error } = await supabase.functions.invoke('invite-member', {
        body: { workspace_id: workspaceId, email, role },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.pendingInvites(workspaceId ?? '') });
    },
  });

  const cancelInvite = useMutation({
    mutationFn: async (inviteId: string) => {
      const { error } = await supabase.functions.invoke('cancel-invite', {
        body: { invite_id: inviteId },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.pendingInvites(workspaceId ?? '') });
    },
  });

  return { members, pendingInvites, updateRole, removeMember, inviteMember, cancelInvite };
}
