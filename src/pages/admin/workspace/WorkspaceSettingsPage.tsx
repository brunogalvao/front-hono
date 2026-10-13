import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Building2, LogOut, ShieldCheck, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { CategoryManager } from '@/components/workspace/CategoryManager';
import { useWorkspace } from '@/context/WorkspaceContext';
import { usePermissions } from '@/hooks/usePermissions';
import { ApiError } from '@/lib/api-error';
import { queryKeys } from '@/lib/query-keys';
import { deleteWorkspace, leaveWorkspace } from '@/service/workspaces';

type LifecycleAction = 'delete' | 'leave' | null;

export default function WorkspaceSettingsPage() {
  const { t } = useTranslation(['workspace', 'nav']);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeWorkspace, workspaces, switchWorkspace, removeWorkspace } =
    useWorkspace();
  const {
    can,
    currentUserId,
    isSuperAdmin,
    isLoading: isPermissionLoading,
  } = usePermissions();
  const [lifecycleAction, setLifecycleAction] = useState<LifecycleAction>(null);
  const [confirmationName, setConfirmationName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!activeWorkspace || isPermissionLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const canManageMembers = can('members', 'read');
  const canManageCategories =
    can('settings', 'read') && can('categories', 'read');
  const remainingWorkspaces = workspaces.filter(
    (workspace) => workspace.id !== activeWorkspace.id
  );
  const confirmationMatches = confirmationName === activeWorkspace.name;
  const ownedWorkspaceCount = isSuperAdmin
    ? workspaces.filter((workspace) => workspace.superuser_id === currentUserId)
        .length
    : 0;
  const isLastOwnedWorkspace = isSuperAdmin && ownedWorkspaceCount <= 1;

  const closeLifecycleDialog = () => {
    if (isSubmitting) return;
    setLifecycleAction(null);
    setConfirmationName('');
  };

  const handleLifecycleAction = async () => {
    if (!lifecycleAction) return;

    try {
      setIsSubmitting(true);
      if (lifecycleAction === 'delete') {
        await deleteWorkspace(activeWorkspace.id);
      } else {
        await leaveWorkspace(activeWorkspace.id);
      }

      removeWorkspace(activeWorkspace.id);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.workspaces.list,
      });

      toast.success(
        t(
          lifecycleAction === 'delete'
            ? 'settings.lifecycle.deleteSuccess'
            : 'settings.lifecycle.leaveSuccess'
        )
      );
      setLifecycleAction(null);
      setConfirmationName('');
      await navigate({
        to:
          remainingWorkspaces.length > 0
            ? '/admin/dashboard'
            : '/admin/profile',
        replace: true,
      });
    } catch (error) {
      const code =
        error instanceof ApiError ? error.code : 'workspace_management_failed';
      toast.error(
        t(`settings.lifecycle.errors.${code}`, {
          defaultValue: t(
            'settings.lifecycle.errors.workspace_management_failed'
          ),
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t('settings.title')}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t('settings.subtitle')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="text-primary size-5" aria-hidden="true" />
            {t('settings.workspacesCard')}
          </CardTitle>
          <CardDescription>{t('settings.workspacesCardDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {workspaces.map((workspace) => {
            const isActive = workspace.id === activeWorkspace.id;
            const isOwned = workspace.superuser_id === currentUserId;
            return (
              <div
                key={workspace.id}
                className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center"
              >
                <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg font-semibold">
                  {workspace.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {workspace.name}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {t(
                      isOwned
                        ? 'nav:roles.owner'
                        : `nav:roles.${workspace.role}`,
                      { defaultValue: workspace.role }
                    )}
                  </p>
                </div>
                {isActive ? (
                  <Badge variant="secondary">{t('settings.active')}</Badge>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => switchWorkspace(workspace.id)}
                  >
                    {t('settings.manage')}
                  </Button>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {canManageMembers && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="text-primary size-5" aria-hidden="true" />
              {t('settings.membersCard')}
            </CardTitle>
            <CardDescription>{t('settings.membersCardDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: '/admin/settings/members' })}
            >
              <ShieldCheck className="size-4" aria-hidden="true" />
              {t('settings.manageMembers')}
            </Button>
          </CardContent>
        </Card>
      )}

      {canManageCategories && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t('settings.categoriesCard')}
            </CardTitle>
            <CardDescription>
              {t('settings.categoriesCardDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryManager />
          </CardContent>
        </Card>
      )}

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive text-base">
            {t('settings.lifecycle.title')}
          </CardTitle>
          <CardDescription>
            {t(
              isSuperAdmin
                ? 'settings.lifecycle.deleteSummary'
                : 'settings.lifecycle.leaveSummary'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="destructive"
            disabled={isLastOwnedWorkspace}
            onClick={() =>
              setLifecycleAction(isSuperAdmin ? 'delete' : 'leave')
            }
          >
            {isSuperAdmin ? (
              <Trash2 className="size-4" aria-hidden="true" />
            ) : (
              <LogOut className="size-4" aria-hidden="true" />
            )}
            {t(
              isSuperAdmin
                ? 'settings.lifecycle.deleteAction'
                : 'settings.lifecycle.leaveAction'
            )}
          </Button>
          {isLastOwnedWorkspace && (
            <p className="text-muted-foreground mt-2 text-xs">
              {t('settings.lifecycle.lastOwnedHint')}
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={lifecycleAction !== null}
        onOpenChange={(open) => !open && closeLifecycleDialog()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t(
                lifecycleAction === 'delete'
                  ? 'settings.lifecycle.deleteTitle'
                  : 'settings.lifecycle.leaveTitle'
              )}
            </DialogTitle>
            <DialogDescription>
              {t(
                lifecycleAction === 'delete'
                  ? 'settings.lifecycle.deleteDescription'
                  : 'settings.lifecycle.leaveDescription',
                { workspace: activeWorkspace.name }
              )}
            </DialogDescription>
          </DialogHeader>

          {lifecycleAction === 'delete' && (
            <div className="space-y-2">
              <label
                htmlFor="workspace-confirmation"
                className="text-sm font-medium"
              >
                {t('settings.lifecycle.confirmLabel', {
                  workspace: activeWorkspace.name,
                })}
              </label>
              <Input
                id="workspace-confirmation"
                value={confirmationName}
                onChange={(event) => setConfirmationName(event.target.value)}
                autoComplete="off"
                disabled={isSubmitting}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={closeLifecycleDialog}
              disabled={isSubmitting}
            >
              {t('settings.lifecycle.cancel')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={
                isSubmitting ||
                (lifecycleAction === 'delete' && !confirmationMatches)
              }
              onClick={() => void handleLifecycleAction()}
            >
              {isSubmitting
                ? t('settings.lifecycle.processing')
                : t(
                    lifecycleAction === 'delete'
                      ? 'settings.lifecycle.confirmDelete'
                      : 'settings.lifecycle.confirmLeave'
                  )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
