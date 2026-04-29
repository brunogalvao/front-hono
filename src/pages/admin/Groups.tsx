import { useState } from 'react';
import { toast } from 'sonner';
import { Users, UserPlus, Trash2, Mail, Loader2 } from 'lucide-react';
import { PatternFormat } from 'react-number-format';
import { z } from 'zod';

import TituloPage from '@/components/TituloPage';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
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
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import { LiquidButton } from '@/components/animate-ui/buttons/liquid';
import { SendIcon } from '@/components/animate-ui/icons/send';

import { useGroups, useGroupMembers, useInviteMember, useRemoveMember } from '@/hooks/use-groups';
import { useCurrentUser } from '@/hooks/use-user-profile';
import { getInitials } from '@/utils/getInitials';
import { phoneSchema } from '@/model/phone.model';
import type { GroupMember } from '@/service/groups/getGroupMembers';

const SECTION_CHIPS = [
  { label: 'Despesas',       icon: '💸' },
  { label: 'Rendimentos',    icon: '💰' },
  { label: 'Compras a Prazo', icon: '🛒' },
  { label: 'Consultor IA',   icon: '🤖' },
];

const inviteSchema = z.object({
  name:  z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido'),
  phone: phoneSchema.optional().or(z.literal('')),
});

// ─── Skeletons ────────────────────────────────────────────────────────────────

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

// ─── MemberCard ───────────────────────────────────────────────────────────────

interface MemberCardProps {
  member: GroupMember;
  isCurrentUser: boolean;
  isOwner: boolean;
  currentUserIsOwner: boolean;
  onRemove: (userId: string, name: string) => void;
}

function MemberCard({ member, isCurrentUser, isOwner, currentUserIsOwner, onRemove }: MemberCardProps) {
  const name     = member.display_name || member.email?.split('@')[0] || 'Usuário';
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

// ─── InviteForm ───────────────────────────────────────────────────────────────

interface InviteFormProps {
  groupId: string;
  onSuccess: () => void;
}

function InviteForm({ groupId, onSuccess }: InviteFormProps) {
  const inviteMutation = useInviteMember(groupId);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  function handleSubmit() {
    const result = inviteSchema.safeParse(form);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    inviteMutation.mutate(
      { name: form.name, email: form.email, phone: form.phone || undefined },
      {
        onSuccess: () => {
          toast.success('Convite enviado com sucesso!');
          setForm({ name: '', email: '', phone: '' });
          onSuccess();
        },
        onError: (err: Error) => toast.error(err.message),
      },
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Convidar novo membro</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col space-y-6">
        {/* Linha 1: Nome + Telefone */}
        <div className="flex flex-row gap-6">
          <div className="flex w-full flex-col gap-2">
            <Label htmlFor="invite-name">Nome</Label>
            <Input
              id="invite-name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Nome completo"
            />
          </div>

          <div className="flex w-full flex-col gap-2">
            <Label htmlFor="invite-phone">Telefone</Label>
            <PatternFormat
              id="invite-phone"
              value={form.phone}
              onValueChange={(v) => setForm((p) => ({ ...p, phone: v.formattedValue }))}
              format="(##) #####-####"
              mask="_"
              customInput={Input}
              placeholder="(00) 00000-0000"
            />
          </div>
        </div>

        {/* Linha 2: E-mail */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="invite-email">E-mail</Label>
          <Input
            id="invite-email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            placeholder="nome@exemplo.com"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>
      </CardContent>

      <CardFooter className="flex justify-end">
        <AnimateIcon animateOnHover>
          <LiquidButton
            className="text-white"
            onClick={handleSubmit}
            disabled={inviteMutation.isPending}
          >
            <div className="flex items-center gap-3 px-8">
              {inviteMutation.isPending ? (
                <>
                  Enviando
                  <Loader2 className="size-4 animate-spin" />
                </>
              ) : (
                <>
                  Enviar convite
                  <SendIcon className="size-4" />
                </>
              )}
            </div>
          </LiquidButton>
        </AnimateIcon>
      </CardFooter>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Groups() {
  const { data: groups, isLoading: loadingGroups } = useGroups();
  const { data: currentUser } = useCurrentUser();

  const activeGroup        = groups?.[0];
  const activeGroupId      = activeGroup?.id ?? '';
  const currentUserIsOwner = activeGroup?.role === 'owner';

  const { data: members, isLoading: loadingMembers } = useGroupMembers(activeGroupId);
  const removeMutation = useRemoveMember(activeGroupId);

  const [showInviteForm, setShowInviteForm]   = useState(false);
  const [removeTarget, setRemoveTarget]       = useState<{ id: string; name: string } | null>(null);

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
    <div className="mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <TituloPage titulo={activeGroup?.name ?? 'Grupo'} />
        {currentUserIsOwner && !showInviteForm && (
          <Button onClick={() => setShowInviteForm(true)} className="gap-2" size="sm">
            <UserPlus className="size-4" />
            Convidar membro
          </Button>
        )}
      </div>

      {/* Formulário de convite — visível apenas quando o owner clica em "Convidar membro" */}
      {currentUserIsOwner && showInviteForm && (
        <InviteForm
          groupId={activeGroupId}
          onSuccess={() => setShowInviteForm(false)}
        />
      )}

      {/* Lista de membros */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="size-4" />
          <span>
            {members?.length ?? 0}{' '}
            {members?.length === 1 ? 'membro' : 'membros'}
          </span>
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
