import { useState } from 'react';
import { toast } from 'sonner';
import { Users, UserPlus, Trash2, Mail } from 'lucide-react';

import TituloPage from '@/components/TituloPage';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

import { useGroups, useGroupMembers, useInviteMember, useRemoveMember } from '@/hooks/use-groups';
import { useCurrentUser } from '@/hooks/use-user-profile';
import { getInitials } from '@/utils/getInitials';
import type { GroupMember } from '@/service/groups/getGroupMembers';

const SECTION_CHIPS = [
  { label: 'Despesas', icon: '💸' },
  { label: 'Rendimentos', icon: '💰' },
  { label: 'Compras a Prazo', icon: '🛒' },
  { label: 'Consultor IA', icon: '🤖' },
];

function MemberSkeleton() {
  return (
    <Card className="border-border/50">
      <CardContent className="flex items-start gap-4 pt-5">
        <Skeleton className="size-12 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
          <div className="flex gap-2 pt-1">
            {SECTION_CHIPS.map((s) => (
              <Skeleton key={s.label} className="h-5 w-20 rounded-full" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface MemberCardProps {
  member: GroupMember;
  isCurrentUser: boolean;
  isOwner: boolean;
  currentUserIsOwner: boolean;
  onRemove: (userId: string, name: string) => void;
}

function MemberCard({ member, isCurrentUser, isOwner, currentUserIsOwner, onRemove }: MemberCardProps) {
  const name = member.display_name || member.email?.split('@')[0] || 'Usuário';
  const initials = getInitials(name);

  return (
    <Card className="border-border/50 transition-shadow hover:shadow-sm">
      <CardContent className="flex items-start gap-4 pt-5">
        <Avatar className="size-12 flex-shrink-0">
          {member.avatar_url && <AvatarImage src={member.avatar_url} alt={name} />}
          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm truncate">{name}</span>
            {isCurrentUser && (
              <Badge variant="outline" className="text-xs px-1.5 py-0">
                você
              </Badge>
            )}
            <Badge
              className={`text-xs px-2 py-0.5 ${
                isOwner
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {isOwner ? 'Owner' : 'Membro'}
            </Badge>
          </div>

          {member.email && (
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              <Mail className="size-3" />
              {member.email}
            </p>
          )}

          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {SECTION_CHIPS.map((chip) => (
              <span
                key={chip.label}
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
              >
                <span>{chip.icon}</span>
                {chip.label}
              </span>
            ))}
          </div>
        </div>

        {currentUserIsOwner && !isCurrentUser && (
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive flex-shrink-0"
            onClick={() => onRemove(member.user_id, name)}
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function Groups() {
  const { data: groups, isLoading: loadingGroups } = useGroups();
  const { data: currentUser } = useCurrentUser();

  const activeGroup = groups?.[0];
  const activeGroupId = activeGroup?.id ?? '';
  const currentUserIsOwner = activeGroup?.role === 'owner';

  const { data: members, isLoading: loadingMembers } = useGroupMembers(activeGroupId);
  const inviteMutation = useInviteMember(activeGroupId);
  const removeMutation = useRemoveMember(activeGroupId);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const [removeTarget, setRemoveTarget] = useState<{ id: string; name: string } | null>(null);

  function handleInvite() {
    if (!inviteEmail.trim()) return;
    inviteMutation.mutate(inviteEmail.trim(), {
      onSuccess: () => {
        toast.success('Convite enviado com sucesso!');
        setInviteEmail('');
        setInviteOpen(false);
      },
      onError: (err: Error) => toast.error(err.message),
    });
  }

  function handleRemoveConfirm() {
    if (!removeTarget) return;
    removeMutation.mutate(removeTarget.id, {
      onSuccess: () => {
        toast.success('Membro removido.');
        setRemoveTarget(null);
      },
      onError: (err: Error) => toast.error(err.message),
    });
  }

  if (loadingGroups) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-7 w-40" />
        <MemberSkeleton />
        <MemberSkeleton />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <TituloPage titulo={activeGroup?.name ?? 'Grupo'} />
        {currentUserIsOwner && (
          <Button onClick={() => setInviteOpen(true)} className="gap-2" size="sm">
            <UserPlus className="size-4" />
            Convidar membro
          </Button>
        )}
      </div>

      <section className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="size-4" />
          <span>{members?.length ?? 0} {members?.length === 1 ? 'membro' : 'membros'}</span>
        </div>

        {loadingMembers ? (
          <>
            <MemberSkeleton />
            <MemberSkeleton />
          </>
        ) : (
          members?.map((member) => (
            <MemberCard
              key={member.user_id}
              member={member}
              isCurrentUser={member.user_id === currentUser?.id}
              isOwner={member.role === 'owner'}
              currentUserIsOwner={currentUserIsOwner}
              onRemove={(id, name) => setRemoveTarget({ id, name })}
            />
          ))
        )}
      </section>

      {/* Dialog de convite */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Convidar membro</DialogTitle>
            <DialogDescription>
              Envie um convite por e-mail. O link expira em 48 horas.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="invite-email">E-mail</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="nome@exemplo.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleInvite}
              disabled={!inviteEmail.trim() || inviteMutation.isPending}
              className="gap-2"
            >
              {inviteMutation.isPending ? 'Enviando...' : 'Enviar convite'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmação de remoção */}
      <AlertDialog open={!!removeTarget} onOpenChange={(open) => !open && setRemoveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover membro</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <strong>{removeTarget?.name}</strong> do grupo?
              Ele perderá o acesso às despesas e rendimentos compartilhados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
