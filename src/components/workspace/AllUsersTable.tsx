import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Shield, UserMinus, UserPlus } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { GuestPermissionEditor } from '@/components/workspace/GuestPermissionEditor';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';
import { useWorkspaceMembers } from '@/hooks/useWorkspaceMembers';
import type { AppUser } from '@/hooks/useAllAppUsers';
import type { WorkspaceRole } from '@/context/WorkspaceContext';

const ROLE_KEYS: WorkspaceRole[] = [
  'super_administrador',
  'administrador',
  'operador',
  'visualizador',
];

interface AllUsersTableProps {
  users: AppUser[] | undefined;
  isLoading: boolean;
  currentUserId: string;
  workspaceId: string;
  isSuperAdmin?: boolean;
}

export function AllUsersTable({
  users,
  isLoading,
  currentUserId,
  workspaceId,
  isSuperAdmin = false,
}: AllUsersTableProps) {
  const { t } = useTranslation(['permissions', 'common']);
  const queryClient = useQueryClient();
  const { updateRole, removeMember } = useWorkspaceMembers(workspaceId);
  const [removeTarget, setRemoveTarget] = useState<AppUser | null>(null);
  const [addTarget, setAddTarget] = useState<AppUser | null>(null);
  const [permissionsTarget, setPermissionsTarget] = useState<AppUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<WorkspaceRole>('visualizador');

  // Direct insert for existing app users (no email invite needed)
  const addMember = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: WorkspaceRole }) => {
      const { error } = await supabase
        .from('workspace_members')
        .insert({ workspace_id: workspaceId, user_id: userId, role });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appUsers.byWorkspace(workspaceId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.members(workspaceId) });
    },
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.appUsers.byWorkspace(workspaceId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.members(workspaceId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.list });
  };

  const handleUpdateRole = async (memberId: string, role: WorkspaceRole) => {
    try {
      await updateRole.mutateAsync({ memberId, role });
      invalidateAll();
      toast.success(t('allUsers.toast.roleUpdated'));
    } catch {
      toast.error(t('allUsers.toast.roleUpdateError'));
    }
  };

  const handleRemove = async () => {
    if (!removeTarget?.memberId) return;
    try {
      await removeMember.mutateAsync(removeTarget.memberId);
      invalidateAll();
      toast.success(t('allUsers.toast.memberRemoved'));
    } catch {
      toast.error(t('allUsers.toast.memberRemoveError'));
    }
    setRemoveTarget(null);
  };

  const handleAddToWorkspace = async () => {
    if (!addTarget) return;
    try {
      await addMember.mutateAsync({ userId: addTarget.profile.id, role: selectedRole });
      toast.success(t('allUsers.toast.userAdded'));
    } catch {
      toast.error(t('allUsers.toast.userAddError'));
    }
    setAddTarget(null);
    setSelectedRole('visualizador');
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-2">
        {(users ?? []).map((user) => {
          const { profile, role, memberId } = user;
          const name = profile.full_name ?? profile.email;
          const isSelf = profile.id === currentUserId;
          const isMember = role !== null;

          return (
            <div key={profile.id} className="flex items-center gap-3 rounded-lg border p-3">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="truncate font-medium text-sm">{name}</p>
                <p className="text-muted-foreground truncate text-xs">{profile.email}</p>
              </div>

              {/* Role area */}
              {isMember ? (
                isSelf || !isSuperAdmin ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Badge variant="secondary" className="text-xs">
                          {t(`roles.${role!}`, { defaultValue: role! })}
                        </Badge>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {isSelf
                          ? t('allUsers.cannotChangeOwnRole')
                          : t('allUsers.onlySuperAdminCanChangeRoles')}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Select
                    value={role!}
                    onValueChange={(v) => handleUpdateRole(memberId!, v as WorkspaceRole)}
                  >
                    <SelectTrigger className="w-36 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_KEYS.filter((k) => k !== 'super_administrador').map((k) => (
                        <SelectItem key={k} value={k} className="text-xs">
                          {t(`roles.${k}`, { defaultValue: k })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )
              ) : (
                <Badge variant="outline" className="text-xs text-muted-foreground shrink-0">
                  {t('allUsers.noAccess')}
                </Badge>
              )}

              {/* Actions */}
              {isMember && !isSelf && (
                <>
                  {isSuperAdmin && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      title={t('allUsers.individualPermissions')}
                      onClick={() => setPermissionsTarget(user)}
                    >
                      <Shield className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive h-8 w-8 shrink-0"
                    onClick={() => setRemoveTarget(user)}
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                </>
              )}

              {!isMember && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => {
                    setAddTarget(user);
                    setSelectedRole('visualizador');
                  }}
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        })}

        {(users ?? []).length === 0 && (
          <p className="text-muted-foreground text-sm text-center py-4">
            {t('allUsers.empty')}
          </p>
        )}
      </div>

      {/* Remove confirmation dialog */}
      <AlertDialog open={!!removeTarget} onOpenChange={(open) => !open && setRemoveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('allUsers.removeTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('allUsers.removeDescription', {
                name: removeTarget?.profile.full_name ?? removeTarget?.profile.email,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common:cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleRemove}
            >
              {t('allUsers.remove')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add to workspace dialog */}
      <AlertDialog open={!!addTarget} onOpenChange={(open) => !open && setAddTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('allUsers.addTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              <Trans
                ns="permissions"
                i18nKey="allUsers.addDescription"
                values={{ name: addTarget?.profile.full_name ?? addTarget?.profile.email }}
                components={{ strong: <strong /> }}
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="px-4 pb-2">
            <Select
              value={selectedRole}
              onValueChange={(v) => setSelectedRole(v as WorkspaceRole)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_KEYS.filter((k) => k !== 'super_administrador').map((k) => (
                  <SelectItem key={k} value={k}>
                    {t(`roles.${k}`, { defaultValue: k })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common:cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleAddToWorkspace}>{t('allUsers.add')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Guest permissions dialog */}
      <Dialog
        open={!!permissionsTarget}
        onOpenChange={(open) => !open && setPermissionsTarget(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {t('allUsers.guestDialogTitle', {
                name: permissionsTarget?.profile.full_name ?? permissionsTarget?.profile.email,
              })}
            </DialogTitle>
            <DialogDescription>{t('allUsers.guestDialogDescription')}</DialogDescription>
          </DialogHeader>
          {permissionsTarget && (
            <GuestPermissionEditor
              workspaceId={workspaceId}
              userId={permissionsTarget.profile.id}
              currentUserId={currentUserId}
            />
          )}
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
