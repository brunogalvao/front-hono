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
    data: profiles,
    error: profilesError,
    count,
  } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url', { count: 'exact' })
    .order('full_name', { ascending: true, nullsFirst: false })
    .order('email', { ascending: true })
    .range(from, to);

  if (profilesError) throw profilesError;

  const profileIds = (profiles ?? []).map((profile) => profile.id);
  const { data: members, error: membersError } = profileIds.length
    ? await supabase
        .from('workspace_members')
        .select('id, user_id, role')
        .eq('workspace_id', workspaceId)
        .in('user_id', profileIds)
    : { data: [], error: null };

  if (membersError) throw membersError;

  const memberMap = new Map(
    (members ?? []).map((m) => [
      m.user_id,
      { role: m.role as WorkspaceRole, memberId: m.id },
    ])
  );

  const users = (profiles ?? []).map((profile) => {
    const membership = memberMap.get(profile.id);
    return {
      profile: profile as AppUserProfile,
      role: membership?.role ?? null,
      memberId: membership?.memberId ?? null,
    };
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
