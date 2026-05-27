import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useWorkspaceMembers, type WorkspaceMember } from '@/hooks/useWorkspaceMembers';
import { useWorkspace, type WorkspaceRole } from '@/context/WorkspaceContext';
import { canManageMembers } from '@/lib/permissions';
import { toast } from 'sonner';

const ROLE_LABELS: Record<WorkspaceRole, string> = {
  administrador: 'Administrador',
  operador: 'Operador',
  visualizador: 'Visualizador',
};

interface MemberListProps {
  currentUserId: string;
  superuserId: string;
}

export function MemberList({ currentUserId, superuserId }: MemberListProps) {
  const { activeWorkspaceId, activeRole } = useWorkspace();
  const { members, pendingInvites, updateRole, removeMember, cancelInvite } = useWorkspaceMembers(activeWorkspaceId);
  const [removeTarget, setRemoveTarget] = useState<WorkspaceMember | null>(null);
  const isAdmin = canManageMembers(activeRole);

  const handleUpdateRole = async (memberId: string, role: WorkspaceRole) => {
    try {
      await updateRole.mutateAsync({ memberId, role });
      toast.success('Papel atualizado.');
    } catch { toast.error('Erro ao atualizar papel.'); }
  };

  const handleRemove = async () => {
    if (!removeTarget) return;
    try {
      await removeMember.mutateAsync(removeTarget.id);
      toast.success('Membro removido.');
    } catch { toast.error('Erro ao remover membro.'); }
    setRemoveTarget(null);
  };

  const handleCancelInvite = async (inviteId: string) => {
    try {
      await cancelInvite.mutateAsync(inviteId);
      toast.success('Convite cancelado.');
    } catch { toast.error('Erro ao cancelar convite.'); }
  };

  if (members.isLoading) {
    return <div className="space-y-2">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}</div>;
  }

  return (
    <>
      <div className="space-y-2">
        {(members.data ?? []).map((member) => {
          const profile = member.profiles;
          const name = profile?.full_name ?? profile?.email ?? 'Usuário';
          const isSuperuser = member.user_id === superuserId;
          const isSelf = member.user_id === currentUserId;

          return (
            <div key={member.id} className="flex items-center gap-3 rounded-lg border p-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium text-sm">{name}</p>
                <p className="text-muted-foreground truncate text-xs">{profile?.email}</p>
              </div>
              {isSuperuser && <Badge variant="outline" className="text-xs shrink-0">Superusuário</Badge>}

              {isAdmin && !isSuperuser && !isSelf ? (
                <Select
                  value={member.role}
                  onValueChange={(v) => handleUpdateRole(member.id, v as WorkspaceRole)}
                >
                  <SelectTrigger className="w-36 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLE_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant="secondary" className="text-xs shrink-0">{ROLE_LABELS[member.role]}</Badge>
              )}

              {isAdmin && !isSuperuser && !isSelf && (
                <Button
                  variant="ghost" size="icon"
                  className="text-destructive hover:text-destructive h-8 w-8 shrink-0"
                  onClick={() => setRemoveTarget(member)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {(pendingInvites.data ?? []).length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-muted-foreground text-sm font-medium">Convites pendentes</p>
          {(pendingInvites.data ?? []).map((invite) => (
            <div key={invite.id} className="flex items-center gap-3 rounded-lg border border-dashed p-3">
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm">{invite.email}</p>
                <p className="text-muted-foreground text-xs">
                  {ROLE_LABELS[invite.role]} • Expira {new Date(invite.expires_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              {isAdmin && (
                <Button
                  variant="ghost" size="sm"
                  className="text-muted-foreground h-7 text-xs"
                  onClick={() => handleCancelInvite(invite.id)}
                >
                  Cancelar
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!removeTarget} onOpenChange={(open) => !open && setRemoveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover membro?</AlertDialogTitle>
            <AlertDialogDescription>
              {removeTarget?.profiles?.full_name ?? removeTarget?.profiles?.email} perderá acesso ao workspace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleRemove}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
