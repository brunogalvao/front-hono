import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';
import type { WorkspaceRole } from '@/context/WorkspaceContext';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

export interface AppUser {
  profile: UserProfile;
  role: WorkspaceRole | null;
  memberId: string | null;
}

async function fetchAllAppUsers(workspaceId: string): Promise<AppUser[]> {
  const [{ data: profiles, error: profilesError }, { data: members, error: membersError }] =
    await Promise.all([
      supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url')
        .order('full_name', { ascending: true, nullsFirst: false }),
      supabase
        .from('workspace_members')
        .select('id, user_id, role')
        .eq('workspace_id', workspaceId),
    ]);

  if (profilesError) throw profilesError;
  if (membersError) throw membersError;

  const memberMap = new Map(
    (members ?? []).map((m) => [m.user_id, { role: m.role as WorkspaceRole, memberId: m.id }]),
  );

  return (profiles ?? []).map((profile) => {
    const membership = memberMap.get(profile.id);
    return {
      profile: profile as UserProfile,
      role: membership?.role ?? null,
      memberId: membership?.memberId ?? null,
    };
  });
}

export function useAllAppUsers(workspaceId: string | null) {
  return useQuery({
    queryKey: queryKeys.appUsers.byWorkspace(workspaceId ?? ''),
    queryFn: () => fetchAllAppUsers(workspaceId!),
    enabled: !!workspaceId,
  });
}
