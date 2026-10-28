import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';
import type { AppUser, AppUserProfile } from '@/model/user.model';
import type { WorkspaceRole } from '@/model/workspace.model';
import i18n from '@/lib/i18n';
import type {
  MemberPermission,
  RolePermission,
} from '@/model/workspace-member.model';
import {
  resolvePermissionMatrix,
  summarizePermissionMatrix,
} from '@/lib/permissions';

export type { AppUser };

export interface PaginatedAppUsers {
  users: AppUser[];
  total: number;
}

export interface AppUsersFilter {
  search?: string;
  role?: WorkspaceRole | 'all';
}

async function fetchAllAppUsers(
  workspaceId: string,
  _superuserId: string,
  page: number,
  pageSize: number,
  filters?: AppUsersFilter
): Promise<PaginatedAppUsers> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const normalizedSearch = filters?.search?.trim() ?? '';
  const roleFilter =
    filters?.role && filters.role !== 'all' ? filters.role : null;

  let matchingSearchProfileIds: string[] | null = null;
  if (normalizedSearch) {
    const { data: matchedProfiles, error: searchError } = await supabase
      .from('profiles')
      .select('id')
      .or(
        `email.ilike.%${normalizedSearch}%,full_name.ilike.%${normalizedSearch}%`
      );
    if (searchError) throw searchError;
    matchingSearchProfileIds = (matchedProfiles ?? []).map((row) => row.id);
    if (matchingSearchProfileIds.length === 0) {
      return { users: [], total: 0 };
    }
  }

  let membersQuery = supabase
    .from('workspace_members')
    .select('id, user_id, role', { count: 'exact' })
    .eq('workspace_id', workspaceId);

  if (roleFilter) {
    membersQuery = membersQuery.eq('role', roleFilter);
  }
  if (matchingSearchProfileIds) {
    membersQuery = membersQuery.in('user_id', matchingSearchProfileIds);
  }

  const {
    data: members,
    error: membersError,
    count,
  } = await membersQuery
    .order('created_at', { ascending: true })
    .range(from, to);

  if (membersError) throw membersError;

  const profileIds = (members ?? []).map((member) => member.user_id);
  const [profilesResult, rolePermissionsResult, overridesResult] =
    await Promise.all([
      profileIds.length
        ? supabase
            .from('profiles')
            .select(
              'id, email, full_name, avatar_url, plan_tier, is_platform_superuser, max_workspaces'
            )
            .in('id', profileIds)
        : Promise.resolve({ data: [], error: null }),
      supabase
        .from('workspace_role_permissions')
        .select('*')
        .eq('workspace_id', workspaceId),
      profileIds.length
        ? supabase
            .from('workspace_member_permissions')
            .select('*')
            .eq('workspace_id', workspaceId)
            .in('user_id', profileIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

  const { data: profiles, error: profilesError } = profilesResult;

  if (profilesError) throw profilesError;
  if (rolePermissionsResult.error) throw rolePermissionsResult.error;
  if (overridesResult.error) throw overridesResult.error;

  const rolePermissions = (rolePermissionsResult.data ??
    []) as RolePermission[];
  const overrides = (overridesResult.data ?? []) as MemberPermission[];

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
        access: summarizePermissionMatrix(
          resolvePermissionMatrix(
            rolePermissions.filter(
              (permission) => permission.role === membership.role
            ),
            overrides.filter(
              (permission) => permission.user_id === membership.user_id
            ),
            Boolean(profile.is_platform_superuser)
          ),
          overrides.filter(
            (permission) => permission.user_id === membership.user_id
          ).length
        ),
      });
      return result;
    }, [])
    .sort((a, b) => {
      const aLabel = a.profile.full_name ?? a.profile.email;
      const bLabel = b.profile.full_name ?? b.profile.email;
      return aLabel.localeCompare(
        bLabel,
        i18n.resolvedLanguage === 'en' ? 'en-US' : 'pt-BR'
      );
    });

  return { users, total: count ?? 0 };
}

export function useAllAppUsers(
  workspaceId: string | null,
  superuserId: string,
  page: number,
  pageSize: number,
  filters?: AppUsersFilter
) {
  const normalizedFilters =
    filters?.search?.trim() || (filters?.role && filters.role !== 'all')
      ? {
          search: filters?.search?.trim().toLowerCase() ?? '',
          role: filters?.role ?? 'all',
        }
      : undefined;

  return useQuery({
    queryKey: queryKeys.appUsers.page(
      workspaceId ?? '',
      page,
      pageSize,
      normalizedFilters
    ),
    queryFn: () =>
      fetchAllAppUsers(workspaceId!, superuserId, page, pageSize, filters),
    enabled: !!workspaceId,
    placeholderData: keepPreviousData,
    staleTime: 15_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: 'always',
  });
}
