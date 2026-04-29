import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getGroups } from '@/service/groups/getGroups';
import { getGroupMembers } from '@/service/groups/getGroupMembers';
import { inviteMember, type InvitePayload } from '@/service/groups/inviteMember';
import { removeMember } from '@/service/groups/removeMember';

export function useGroups() {
  return useQuery({
    queryKey: queryKeys.groups.all,
    queryFn: getGroups,
    staleTime: 1000 * 60 * 5,
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

export function useInviteMember(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InvitePayload) => inviteMember(groupId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.members(groupId) });
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
