import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { AllUsersTable } from '@/components/workspace/AllUsersTable';
import { InviteForm } from '@/components/workspace/InviteForm';
import { PendingInviteList } from '@/components/workspace/PendingInviteList';
import { usePermissions } from '@/hooks/usePermissions';
import { useAllAppUsers } from '@/hooks/useAllAppUsers';
import { useWorkspaceMembers } from '@/hooks/useWorkspaceMembers';
import { useWorkspace, type WorkspaceRole } from '@/context/WorkspaceContext';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';
import {
  Clock3,
  Crown,
  FilterX,
  Search,
  UserPlus,
  Users,
} from 'lucide-react';
import { useRolePermissions } from '@/hooks/useRolePermissions';

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

function useCurrentUserId() {
  return useQuery({
    queryKey: queryKeys.auth.session,
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user?.id ?? null;
    },
  });
}

export default function PermissionsPage() {
  const { t } = useTranslation(['permissions', 'common', 'invite']);
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspace();
  const [usersPage, setUsersPage] = useState(1);
  const [usersPageSize, setUsersPageSize] = useState<number>(10);
  const [memberSearch, setMemberSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<WorkspaceRole | 'all'>('all');
  const { can, isSuperAdmin, isLoading: isPermLoading } = usePermissions();
  const { data: currentUserId } = useCurrentUserId();
  const { data: usersResult, isLoading: isUsersLoading } = useAllAppUsers(
    activeWorkspace?.id ?? null,
    activeWorkspace?.superuser_id ?? '',
    usersPage,
    usersPageSize,
    {
      search: memberSearch,
      role: roleFilter,
    }
  );
  const { data: rolePermissions } = useRolePermissions(
    activeWorkspace?.id ?? null
  );
  const { inviteMember, pendingInvites, resendInvite, cancelInvite } =
    useWorkspaceMembers(activeWorkspace?.id ?? null);

  const canManageMembers = can('members', 'read');
  const canInviteMembers = can('members', 'create');
  const canUpdateMembers = can('members', 'update');
  const canDeleteMembers = can('members', 'delete');
  const users = usersResult?.users;
  const usersTotal = usersResult?.total ?? 0;
  const usersPageCount = Math.ceil(usersTotal / usersPageSize);
  const hasMemberFilters =
    memberSearch.trim().length > 0 || roleFilter !== 'all';

  useEffect(() => {
    setUsersPage(1);
  }, [activeWorkspace?.id, memberSearch, roleFilter, usersPageSize]);

  useEffect(() => {
    if (usersPageCount > 0 && usersPage > usersPageCount) {
      setUsersPage(usersPageCount);
    }
  }, [usersPage, usersPageCount]);

  useEffect(() => {
    if (isPermLoading || !activeWorkspace) return;
    if (!canManageMembers) {
      toast.error(t('page.accessDenied'));
      navigate({ to: '/admin/dashboard' });
    }
  }, [isPermLoading, canManageMembers, activeWorkspace, navigate, t]);

  if (isPermLoading || !activeWorkspace) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!canManageMembers) return null;

  const handleInvite = (
    email: string,
    role: Parameters<typeof inviteMember.mutateAsync>[0]['role']
  ) => inviteMember.mutateAsync({ email, role });

  const handleResend = async (inviteId: string) => {
    try {
      const result = await resendInvite.mutateAsync(inviteId);
      if (result.status === 'sent') toast.success(t('invite:mutation.sent'));
      else if (result.status === 'rate_limited') {
        toast.warning(t('invite:mutation.rate_limited'));
      } else toast.error(t('invite:mutation.delivery_failed'));
    } catch {
      toast.error(t('invite:states.failedDescription'));
    }
  };

  const handleCancel = async (inviteId: string) => {
    try {
      await cancelInvite.mutateAsync(inviteId);
      toast.success(t('invite:list.cancelled'));
    } catch {
      toast.error(t('invite:states.failedDescription'));
    }
  };

  const busyInviteId =
    resendInvite.isPending || cancelInvite.isPending
      ? (resendInvite.variables ?? cancelInvite.variables)
      : undefined;
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t('page.title')}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isSuperAdmin
              ? t('page.subtitleSuperAdmin', {
                  workspace: activeWorkspace.name,
                })
              : t('page.subtitleAdmin', { workspace: activeWorkspace.name })}
          </p>
        </div>

        {isSuperAdmin && (
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/settings/permissions">
              <Crown className="mr-1.5 size-4 text-amber-500" aria-hidden="true" />
              {t('page.goToSuperuserManagement')}
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="text-primary size-5" />
            {t('allUsers.title')}
          </CardTitle>
          <CardDescription>{t('allUsers.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {canInviteMembers && (
            <>
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <UserPlus className="size-4" aria-hidden="true" />
                  <p className="text-sm font-medium">
                    {t('allUsers.inviteByEmail')}
                  </p>
                </div>
                <p className="text-muted-foreground text-xs">
                  {t('allUsers.inviteDescription')}
                </p>
                <InviteForm
                  onInvite={handleInvite}
                  rolePermissions={rolePermissions}
                />
              </section>

              <Separator />
            </>
          )}

          <section className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Users className="size-4" aria-hidden="true" />
                <p className="text-sm font-medium">
                  {t('allUsers.memberCount', { count: usersTotal })}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-56 flex-1 sm:w-64 sm:flex-initial">
                  <Search
                    className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
                    aria-hidden="true"
                  />
                  <Input
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder={t('allUsers.filters.searchPlaceholder')}
                    aria-label={t('allUsers.filters.searchPlaceholder')}
                    className="h-9 pl-9 text-xs"
                  />
                </div>

                <Select
                  value={roleFilter}
                  onValueChange={(value) =>
                    setRoleFilter(value as WorkspaceRole | 'all')
                  }
                >
                  <SelectTrigger
                    className="h-9 w-full text-xs sm:w-40"
                    aria-label={t('allUsers.filters.roleLabel')}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">
                      {t('allUsers.filters.roleAll')}
                    </SelectItem>
                    <SelectItem value="administrador" className="text-xs">
                      {t('roles.administrador')}
                    </SelectItem>
                    <SelectItem value="operador" className="text-xs">
                      {t('roles.operador')}
                    </SelectItem>
                    <SelectItem value="visualizador" className="text-xs">
                      {t('roles.visualizador')}
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={String(usersPageSize)}
                  onValueChange={(val) => setUsersPageSize(Number(val))}
                >
                  <SelectTrigger
                    className="h-9 w-28 text-xs"
                    aria-label={t('platformUsers.pagination.perPageLabel')}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <SelectItem
                        key={size}
                        value={String(size)}
                        className="text-xs"
                      >
                        {t('platformUsers.pagination.perPage', { count: size })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {hasMemberFilters && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-9 text-xs"
                    onClick={() => {
                      setMemberSearch('');
                      setRoleFilter('all');
                    }}
                  >
                    <FilterX className="mr-1.5 size-3.5" aria-hidden="true" />
                    {t('platformUsers.filters.clear')}
                  </Button>
                )}
              </div>
            </div>

            <AllUsersTable
              users={users}
              isLoading={isUsersLoading}
              currentUserId={currentUserId ?? ''}
              workspaceId={activeWorkspace.id}
              isSuperAdmin={isSuperAdmin}
              canCreateMembers={canInviteMembers}
              canUpdateMembers={canUpdateMembers}
              canDeleteMembers={canDeleteMembers}
              pendingInvites={pendingInvites.data ?? []}
              busyInviteId={busyInviteId}
              onResendInvite={handleResend}
              onCancelInvite={handleCancel}
              page={usersPage}
              pageCount={usersPageCount}
              total={usersTotal}
              onPageChange={setUsersPage}
            />
          </section>

          <Separator />

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock3 className="size-4" aria-hidden="true" />
              <p className="text-sm font-medium">{t('invite:list.title')}</p>
            </div>
            <PendingInviteList
              invites={pendingInvites.data ?? []}
              isLoading={pendingInvites.isLoading}
              busyInviteId={busyInviteId}
              onResend={handleResend}
              onCancel={handleCancel}
              canResend={canInviteMembers}
              canCancel={canDeleteMembers}
              rolePermissions={rolePermissions}
            />
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
