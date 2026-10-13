import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  LogOut,
  MoreHorizontal,
  Plus,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { CreateWorkspaceDialog } from '@/components/workspace/CreateWorkspaceDialog';
import { useWorkspace } from '@/context/WorkspaceContext';
import { usePermissions } from '@/hooks/usePermissions';
import { ApiError } from '@/lib/api-error';
import { queryKeys } from '@/lib/query-keys';
import type { WorkspaceInfo } from '@/model/workspace.model';
import { deleteWorkspace, leaveWorkspace } from '@/service/workspaces';

type LifecycleAction = {
  type: 'delete' | 'leave';
  workspace: WorkspaceInfo;
} | null;

export default function WorkspaceSettingsPage() {
  const { t } = useTranslation(['workspace', 'nav']);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeWorkspace, workspaces, switchWorkspace, removeWorkspace } =
    useWorkspace();
  const {
    can,
    currentUserId,
    isLoading: isPermissionLoading,
  } = usePermissions();
  const [createWorkspaceOpen, setCreateWorkspaceOpen] = useState(false);
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

  const canManageCategories =
    can('settings', 'read') && can('categories', 'read');
  const ownedWorkspaceCount = workspaces.filter(
    (workspace) => workspace.superuser_id === currentUserId
  ).length;
  const canCreateWorkspace = ownedWorkspaceCount > 0;
  const confirmationMatches =
    lifecycleAction?.type === 'delete' &&
    confirmationName === lifecycleAction.workspace.name;

  const closeLifecycleDialog = () => {
    if (isSubmitting) return;
    setLifecycleAction(null);
    setConfirmationName('');
  };

  const handleLifecycleAction = async () => {
    if (!lifecycleAction) return;

    const { type, workspace } = lifecycleAction;
    const removingActiveWorkspace = workspace.id === activeWorkspace.id;
    const remainingWorkspaces = workspaces.filter(
      (item) => item.id !== workspace.id
    );

    try {
      setIsSubmitting(true);
      if (type === 'delete') {
        await deleteWorkspace(workspace.id);
      } else {
        await leaveWorkspace(workspace.id);
      }

      removeWorkspace(workspace.id);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.workspaces.list,
      });

      toast.success(
        t(
          type === 'delete'
            ? 'settings.lifecycle.deleteSuccess'
            : 'settings.lifecycle.leaveSuccess'
        )
      );
      setLifecycleAction(null);
      setConfirmationName('');
      if (removingActiveWorkspace) {
        await navigate({
          to:
            remainingWorkspaces.length > 0
              ? '/admin/dashboard'
              : '/admin/profile',
          replace: true,
        });
      }
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

  const handleManageMembers = async (workspace: WorkspaceInfo) => {
    if (workspace.id !== activeWorkspace.id) {
      switchWorkspace(workspace.id);
    }
    await navigate({ to: '/admin/settings/members' });
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
        <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="text-primary size-5" aria-hidden="true" />
              {t('settings.workspacesCard')}
            </CardTitle>
            <CardDescription>
              {t('settings.workspacesCardDesc')}
            </CardDescription>
          </div>
          {canCreateWorkspace && (
            <Button
              type="button"
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => setCreateWorkspaceOpen(true)}
            >
              <Plus className="size-4" aria-hidden="true" />
              {t('settings.createWorkspace')}
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {canCreateWorkspace && (
            <div className="bg-primary/5 text-muted-foreground flex gap-2 rounded-lg px-3 py-2 text-xs">
              <ShieldCheck
                className="text-primary mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              <p>{t('settings.ownerControlsHint')}</p>
            </div>
          )}
          {workspaces.map((workspace) => {
            const isActive = workspace.id === activeWorkspace.id;
            const isOwned = workspace.superuser_id === currentUserId;
            const isLastOwnedWorkspace = isOwned && ownedWorkspaceCount <= 1;
            return (
              <div
                key={workspace.id}
                className={`flex flex-col gap-3 rounded-lg border p-3 transition-colors sm:flex-row sm:items-center ${
                  isActive ? 'border-primary/30 bg-primary/5' : ''
                }`}
              >
                <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg font-semibold">
                  {workspace.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {workspace.name}
                  </p>
                  <p
                    className={`flex items-center gap-1 text-xs ${
                      isOwned
                        ? 'text-primary font-medium'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {isOwned && (
                      <ShieldCheck className="size-3" aria-hidden="true" />
                    )}
                    {isOwned
                      ? t('settings.superuser')
                      : t(`nav:roles.${workspace.role}`, {
                          defaultValue: workspace.role,
                        })}
                  </p>
                </div>
                <div className="flex items-center gap-2 self-stretch sm:self-auto">
                  {isActive && (
                    <Badge variant="secondary">{t('settings.active')}</Badge>
                  )}
                  {!isActive && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1 sm:flex-none"
                      onClick={() => switchWorkspace(workspace.id)}
                    >
                      {t('settings.openWorkspace')}
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-10"
                        aria-label={t('settings.workspaceActions', {
                          workspace: workspace.name,
                        })}
                      >
                        <MoreHorizontal className="size-4" aria-hidden="true" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-52">
                      <DropdownMenuLabel>
                        {isOwned
                          ? t('settings.ownerActions')
                          : t('settings.memberActions')}
                      </DropdownMenuLabel>
                      {isOwned && (
                        <DropdownMenuItem
                          onSelect={() => void handleManageMembers(workspace)}
                        >
                          <ShieldCheck className="size-4" aria-hidden="true" />
                          {t('settings.manageMembers')}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      {isOwned ? (
                        <DropdownMenuItem
                          variant="destructive"
                          disabled={isLastOwnedWorkspace}
                          onSelect={() =>
                            setLifecycleAction({
                              type: 'delete',
                              workspace,
                            })
                          }
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                          {t('settings.lifecycle.deleteAction')}
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={() =>
                            setLifecycleAction({ type: 'leave', workspace })
                          }
                        >
                          <LogOut className="size-4" aria-hidden="true" />
                          {t('settings.lifecycle.leaveAction')}
                        </DropdownMenuItem>
                      )}
                      {isLastOwnedWorkspace && (
                        <p className="text-muted-foreground max-w-56 px-2 py-1.5 text-xs">
                          {t('settings.lifecycle.lastOwnedHint')}
                        </p>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

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

      <CreateWorkspaceDialog
        open={createWorkspaceOpen}
        onOpenChange={setCreateWorkspaceOpen}
      />

      <Dialog
        open={lifecycleAction !== null}
        onOpenChange={(open) => !open && closeLifecycleDialog()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t(
                lifecycleAction?.type === 'delete'
                  ? 'settings.lifecycle.deleteTitle'
                  : 'settings.lifecycle.leaveTitle'
              )}
            </DialogTitle>
            <DialogDescription>
              {t(
                lifecycleAction?.type === 'delete'
                  ? 'settings.lifecycle.deleteDescription'
                  : 'settings.lifecycle.leaveDescription',
                { workspace: lifecycleAction?.workspace.name ?? '' }
              )}
            </DialogDescription>
          </DialogHeader>

          {lifecycleAction?.type === 'delete' && (
            <div className="space-y-2">
              <label
                htmlFor="workspace-confirmation"
                className="text-sm font-medium"
              >
                {t('settings.lifecycle.confirmLabel', {
                  workspace: lifecycleAction.workspace.name,
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
                (lifecycleAction?.type === 'delete' && !confirmationMatches)
              }
              onClick={() => void handleLifecycleAction()}
            >
              {isSubmitting
                ? t('settings.lifecycle.processing')
                : t(
                    lifecycleAction?.type === 'delete'
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
