import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { AllUsersTable } from '@/components/workspace/AllUsersTable';
import { InviteForm } from '@/components/workspace/InviteForm';
import { PendingInviteList } from '@/components/workspace/PendingInviteList';
import { PermissionMatrix } from '@/components/workspace/PermissionMatrix';
import { usePermissions } from '@/hooks/usePermissions';
import { useAllAppUsers } from '@/hooks/useAllAppUsers';
import { useWorkspaceMembers } from '@/hooks/useWorkspaceMembers';
import { useWorkspace } from '@/context/WorkspaceContext';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';

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
  const { can, isSuperAdmin, isLoading: isPermLoading } = usePermissions();
  const { data: currentUserId } = useCurrentUserId();
  const { data: users, isLoading: isUsersLoading } = useAllAppUsers(
    activeWorkspace?.id ?? null
  );
  const { inviteMember, pendingInvites, resendInvite, cancelInvite } =
    useWorkspaceMembers(activeWorkspace?.id ?? null);

  const canManageMembers = can('members', 'read');

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
  const registeredUserEmails = new Set(
    (users ?? []).map((user) => user.profile.email.toLowerCase())
  );
  const invitesWithoutRegisteredUser = (pendingInvites.data ?? []).filter(
    (invite) => !registeredUserEmails.has(invite.email_normalized.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {isSuperAdmin ? t('page.titleSuperAdmin') : t('page.titleAdmin')}
        </h1>
        <p className="text-muted-foreground text-sm">
          {isSuperAdmin
            ? t('page.subtitleSuperAdmin')
            : t('page.subtitleAdmin')}
        </p>
      </div>

      {isSuperAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('matrix.title')}</CardTitle>
            <CardDescription>{t('matrix.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <PermissionMatrix
              workspaceId={activeWorkspace.id}
              currentUserId={currentUserId ?? ''}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('allUsers.title')}</CardTitle>
          <CardDescription>{t('allUsers.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AllUsersTable
            users={users}
            isLoading={isUsersLoading}
            currentUserId={currentUserId ?? ''}
            workspaceId={activeWorkspace.id}
            isSuperAdmin={isSuperAdmin}
            pendingInvites={pendingInvites.data ?? []}
            busyInviteId={busyInviteId}
            onResendInvite={handleResend}
            onCancelInvite={handleCancel}
          />

          <Separator />

          <div>
            <p className="mb-0 text-sm font-medium">
              {t('allUsers.inviteByEmail')}
            </p>
            <InviteForm onInvite={handleInvite} />
          </div>

          <Separator />

          <div className="space-y-3">
            <p className="text-sm font-medium">{t('invite:list.title')}</p>
            <PendingInviteList
              invites={invitesWithoutRegisteredUser}
              isLoading={pendingInvites.isLoading}
              busyInviteId={busyInviteId}
              onResend={handleResend}
              onCancel={handleCancel}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
