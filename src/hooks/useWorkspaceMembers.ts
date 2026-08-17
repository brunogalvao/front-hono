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
import { API_BASE_URL } from '@/config/api';
import { getAuthToken } from '@/lib/supabase';

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

function isInviteApiResult(value: unknown): value is { status: string } {
  if (!value || typeof value !== 'object' || !('status' in value)) return false;
  return typeof value.status === 'string';
}

async function inviteApi<T extends { status: string }>(
  path: string,
  method: 'POST' | 'DELETE',
  body?: Record<string, unknown>
): Promise<T> {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const result: unknown = await response.json().catch(() => null);
  if (isInviteApiResult(result)) return result as T;
  throw new Error(
    response.ok ? 'invalid_invite_response' : 'invite_request_failed'
  );
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
      return inviteApi<InviteMutationResult>(
        `/api/workspaces/${workspaceId}/invites`,
        'POST',
        {
          email: email.trim().toLowerCase(),
          role,
          locale: activeInviteLocale(),
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspaces.pendingInvites(workspaceId ?? ''),
      });
    },
  });

  const resendInvite = useMutation({
    mutationFn: async (inviteId: string): Promise<InviteMutationResult> => {
      return inviteApi<InviteMutationResult>(
        `/api/workspaces/${workspaceId}/invites/${inviteId}/resend`,
        'POST',
        {
          locale: activeInviteLocale(),
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspaces.pendingInvites(workspaceId ?? ''),
      });
    },
  });

  const cancelInvite = useMutation({
    mutationFn: async (inviteId: string) => {
      const data = await inviteApi<{
        status: 'cancelled' | 'already_cancelled' | string;
      }>(`/api/workspaces/${workspaceId}/invites/${inviteId}`, 'DELETE');
      if (data.status !== 'cancelled' && data.status !== 'already_cancelled') {
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
