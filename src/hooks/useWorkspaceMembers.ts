import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';
import type {
  WorkspaceMember,
  PendingInvite,
} from '@/model/workspace-member.model';
import type { WorkspaceRole } from '@/model/workspace.model';
import type { InviteLocale, InviteMutationResult } from '@/model/invite.model';
import i18n from '@/lib/i18n';

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

async function fetchPendingInvites(
  workspaceId: string
): Promise<PendingInvite[]> {
  const { data, error } = await supabase
    .from('workspace_invites')
    .select(
      'id, email_normalized, role, delivery_status, expires_at, sent_at, last_delivery_attempt_at, created_at'
    )
    .eq('workspace_id', workspaceId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as PendingInvite[];
}

function activeInviteLocale(): InviteLocale {
  return i18n.resolvedLanguage === 'en' ? 'en' : 'pt-BR';
}

function isPublicInviteResult(value: unknown): value is InviteMutationResult {
  if (!value || typeof value !== 'object' || !('status' in value)) return false;
  return [
    'sent',
    'delivery_failed',
    'already_member',
    'existing_pending_invite',
    'rate_limited',
  ].includes(String(value.status));
}

async function publicFunctionError(
  error: unknown
): Promise<InviteMutationResult | null> {
  if (!error || typeof error !== 'object' || !('context' in error)) return null;
  const context = error.context;
  if (!(context instanceof Response)) return null;
  try {
    const body: unknown = await context.clone().json();
    return isPublicInviteResult(body) ? body : null;
  } catch {
    return null;
  }
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
    mutationFn: async ({
      memberId,
      role,
    }: {
      memberId: string;
      role: WorkspaceRole;
    }) => {
      const { error } = await supabase
        .from('workspace_members')
        .update({ role })
        .eq('id', memberId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspaces.members(workspaceId ?? ''),
      });
    },
  });

  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('workspace_members')
        .delete()
        .eq('id', memberId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspaces.members(workspaceId ?? ''),
      });
    },
  });

  const inviteMember = useMutation({
    mutationFn: async ({
      email,
      role,
    }: {
      email: string;
      role: WorkspaceRole;
    }): Promise<InviteMutationResult> => {
      const { data, error } = await supabase.functions.invoke('invite-member', {
        body: {
          operation: 'create',
          workspace_id: workspaceId,
          email: email.trim().toLowerCase(),
          role,
          locale: activeInviteLocale(),
        },
      });
      if (error) {
        const publicResult = await publicFunctionError(error);
        if (publicResult) return publicResult;
        throw error;
      }
      if (!isPublicInviteResult(data))
        throw new Error('invalid_invite_response');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspaces.pendingInvites(workspaceId ?? ''),
      });
    },
  });

  const resendInvite = useMutation({
    mutationFn: async (inviteId: string): Promise<InviteMutationResult> => {
      const { data, error } = await supabase.functions.invoke('invite-member', {
        body: {
          operation: 'resend',
          invite_id: inviteId,
          locale: activeInviteLocale(),
        },
      });
      if (error) {
        const publicResult = await publicFunctionError(error);
        if (publicResult) return publicResult;
        throw error;
      }
      if (!isPublicInviteResult(data))
        throw new Error('invalid_invite_response');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspaces.pendingInvites(workspaceId ?? ''),
      });
    },
  });

  const cancelInvite = useMutation({
    mutationFn: async (inviteId: string) => {
      const { data, error } = await supabase.functions.invoke('cancel-invite', {
        body: { invite_id: inviteId },
      });
      if (error) throw error;
      if (
        data?.status !== 'cancelled' &&
        data?.status !== 'already_cancelled'
      ) {
        throw new Error('invalid_cancel_response');
      }
      return data as { status: 'cancelled' | 'already_cancelled' };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspaces.pendingInvites(workspaceId ?? ''),
      });
    },
  });

  return {
    members,
    pendingInvites,
    updateRole,
    removeMember,
    inviteMember,
    resendInvite,
    cancelInvite,
  };
}
