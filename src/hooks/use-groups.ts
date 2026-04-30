import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { createGroup, type CreateGroupPayload } from '@/service/groups/createGroup';
import { getGroups } from '@/service/groups/getGroups';
import { getGroupMembers } from '@/service/groups/getGroupMembers';
import { getGroupInvites } from '@/service/groups/getGroupInvites';
import { inviteMember, type InvitePayload } from '@/service/groups/inviteMember';
import { removeMember } from '@/service/groups/removeMember';
import { updateMemberAccess } from '@/service/groups/updateMemberAccess';
import { updateInviteAccess } from '@/service/groups/updateInviteAccess';
import { revokeInvite } from '@/service/groups/revokeInvite';
import type { GroupAccess } from '@/service/groups/groupAccess';

export function useGroups() {
  return useQuery({
    queryKey: queryKeys.groups.all,
    queryFn: getGroups,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateGroupPayload) => createGroup(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
    },
  });
}

export function useGroupMembers(groupId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.groups.members(groupId ?? ''),
    queryFn: () => getGroupMembers(groupId!),
    enabled: !!groupId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useGroupInvites(groupId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.groups.invites(groupId ?? ''),
    queryFn: () => getGroupInvites(groupId!),
    enabled: !!groupId,
    staleTime: 1000 * 60,
  });
}

export function useInviteMember(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InvitePayload) => inviteMember(groupId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.members(groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.invites(groupId) });
    },
  });
}

export function useRemoveMember(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => removeMember(groupId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.members(groupId) });
    },
  });
}

export function useUpdateMemberAccess(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      access,
    }: {
      userId: string;
      access: Partial<GroupAccess>;
    }) => updateMemberAccess(groupId, userId, access),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.members(groupId) });
    },
  });
}

export function useUpdateInviteAccess(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      inviteId,
      access,
    }: {
      inviteId: string;
      access: Partial<GroupAccess>;
    }) => updateInviteAccess(groupId, inviteId, access),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.invites(groupId) });
    },
  });
}

export function useRevokeInvite(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) => revokeInvite(groupId, inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.invites(groupId) });
    },
  });
}
