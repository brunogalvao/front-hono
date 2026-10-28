import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Crown, ShieldCheck, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PermissionMatrix } from '@/components/workspace/PermissionMatrix';
import { PlatformUsersCard } from '@/components/workspace/PlatformUsersCard';
import { usePermissions } from '@/hooks/usePermissions';
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

export default function SuperuserManagementPage() {
  const { t } = useTranslation(['permissions', 'common']);
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspace();
  const { can, isSuperAdmin, isLoading: isPermLoading } = usePermissions();
  const { data: currentUserId } = useCurrentUserId();

  const canManagePermissions = isSuperAdmin || can('permissions', 'read');

  useEffect(() => {
    if (isPermLoading || !activeWorkspace) return;
    if (!canManagePermissions) {
      toast.error(t('page.accessDenied'));
      navigate({ to: '/admin/dashboard' });
    }
  }, [isPermLoading, canManagePermissions, activeWorkspace, navigate, t]);

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

  if (!canManagePermissions) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Crown className="text-primary size-6" aria-hidden="true" />
            {t('superuserPage.title')}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t('superuserPage.subtitle', { workspace: activeWorkspace.name })}
          </p>
        </div>

        <Button asChild variant="outline" size="sm">
          <Link to="/admin/settings/members">
            <Users className="mr-1.5 size-4" aria-hidden="true" />
            {t('superuserPage.goToMembers')}
          </Link>
        </Button>
      </div>

      {isSuperAdmin && (
        <PlatformUsersCard currentUserId={currentUserId ?? ''} />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="text-primary size-5" aria-hidden="true" />
            {t('matrix.title')}
          </CardTitle>
          <CardDescription>{t('matrix.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <PermissionMatrix
            workspaceId={activeWorkspace.id}
            currentUserId={currentUserId ?? ''}
          />
        </CardContent>
      </Card>
    </div>
  );
}
