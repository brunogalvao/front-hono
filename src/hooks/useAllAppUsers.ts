import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';
import type { AppUser, AppUserProfile } from '@/model/user.model';
import type { WorkspaceRole } from '@/model/workspace.model';

export type { AppUser };

export interface PaginatedAppUsers {
  users: AppUser[];
  total: number;
}

async function fetchAllAppUsers(
  workspaceId: string,
  page: number,
  pageSize: number
): Promise<PaginatedAppUsers> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const {
    data: members,
    error: membersError,
    count,
  } = await supabase
    .from('workspace_members')
    .select('id, user_id, role', { count: 'exact' })
    .eq('workspace_id', workspaceId)
    .order('joined_at', { ascending: true })
    .range(from, to);

  if (membersError) throw membersError;

  const profileIds = (members ?? []).map((member) => member.user_id);
  const { data: profiles, error: profilesError } = profileIds.length
    ? await supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url')
        .in('id', profileIds)
    : { data: [], error: null };

  if (profilesError) throw profilesError;

  const profileMap = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile as AppUserProfile])
  );

  const users = (members ?? [])
    .reduce<AppUser[]>((result, membership) => {
      const profile = profileMap.get(membership.user_id);
      if (!profile) return result;

      result.push({
        profile,
        role: membership.role as WorkspaceRole,
        memberId: membership.id,
      });
      return result;
    }, [])
    .sort((a, b) => {
      const aLabel = a.profile.full_name ?? a.profile.email;
      const bLabel = b.profile.full_name ?? b.profile.email;
      return aLabel.localeCompare(bLabel, 'pt-BR');
    });

  return { users, total: count ?? 0 };
}

export function useAllAppUsers(
  workspaceId: string | null,
  page: number,
  pageSize: number
) {
  return useQuery({
    queryKey: queryKeys.appUsers.page(workspaceId ?? '', page, pageSize),
    queryFn: () => fetchAllAppUsers(workspaceId!, page, pageSize),
    enabled: !!workspaceId,
    placeholderData: keepPreviousData,
    staleTime: 15_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: 'always',
  });
}
