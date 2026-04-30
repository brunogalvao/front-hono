import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  Clock3,
  Loader2,
  Mail,
  Settings2,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import { PatternFormat } from 'react-number-format';
import { z } from 'zod';

import TituloPage from '@/components/TituloPage';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import { LiquidButton } from '@/components/animate-ui/buttons/liquid';
import { SendIcon } from '@/components/animate-ui/icons/send';
import {
  useGroupInvites,
  useGroupMembers,
  useCreateGroup,
  useGroups,
  useInviteMember,
  useRemoveMember,
  useRevokeInvite,
  useUpdateInviteAccess,
  useUpdateMemberAccess,
} from '@/hooks/use-groups';
import { useCurrentUser } from '@/hooks/use-user-profile';
import { phoneSchema } from '@/model/phone.model';
import type { GroupAccess } from '@/service/groups/groupAccess';
import { defaultGroupAccess } from '@/service/groups/groupAccess';
import type { GroupInvite } from '@/service/groups/getGroupInvites';
import type { GroupMember } from '@/service/groups/getGroupMembers';
import { getInitials } from '@/utils/getInitials';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type AccessKey = keyof GroupAccess;

const ACCESS_OPTIONS: Array<{
  key: AccessKey;
  label: string;
  description: string;
  icon: string;
}> = [
  {
    key: 'access_expenses',
    label: 'Despesas',
    description: 'Permite visualizar e gerenciar despesas.',
    icon: '💸',
  },
  {
    key: 'access_incomes',
    label: 'Rendimentos',
    description: 'Permite visualizar e gerenciar rendimentos.',
    icon: '💰',
  },
  {
    key: 'access_installments',
    label: 'Compras a prazo',
    description: 'Permite acompanhar e editar parcelas.',
    icon: '🛒',
  },
  {
    key: 'access_advisor',
    label: 'Consultor IA',
    description: 'Permite usar os recursos de consultoria financeira.',
    icon: '🤖',
  },
];

const inviteSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido'),
  phone: phoneSchema.optional().or(z.literal('')),
  access_expenses: z.boolean(),
  access_incomes: z.boolean(),
  access_installments: z.boolean(),
  access_advisor: z.boolean(),
});

const createGroupSchema = z.object({
  name: z.string().min(1, 'Nome do grupo é obrigatório'),
  type: z.enum(['personal', 'shared']),
});

const SUPER_ADMIN_EMAIL = 'bruno_galvao@outlook.com';

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('pt-BR');
}

function MemberSkeleton() {
  return (
    <Card className="border-border/50">
      <CardContent className="flex items-start gap-4 pt-5">
        <Skeleton className="size-12 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
          <div className="grid gap-2 md:grid-cols-2">
            {ACCESS_OPTIONS.map((option) => (
              <Skeleton key={option.key} className="h-12 rounded-lg" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface AccessManagerProps {
  access: GroupAccess;
  disabled?: boolean;
  busyKey?: AccessKey | null;
  onToggle?: (key: AccessKey, value: boolean) => void;
}

function AccessManager({
  access,
  disabled = false,
  busyKey = null,
  onToggle,
}: AccessManagerProps) {
  return (
    <div className="grid gap-2 md:grid-cols-2">
      {ACCESS_OPTIONS.map((option) => {
        const checked = access[option.key];
        const isBusy = busyKey === option.key;

        return (
          <div
            key={option.key}
            className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium">
                <span className="mr-1">{option.icon}</span>
                {option.label}
              </p>
              <p className="text-xs text-muted-foreground">{option.description}</p>
            </div>

            <div className="flex items-center gap-2">
              {isBusy && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
              <Switch
                checked={checked}
                disabled={disabled || isBusy || !onToggle}
                onCheckedChange={(value) => onToggle?.(option.key, value)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface MemberCardProps {
  member: GroupMember;
  isCurrentUser: boolean;
  currentUserIsOwner: boolean;
  busyKey: AccessKey | null;
  onRemove: (userId: string, name: string) => void;
  onAccessChange: (userId: string, key: AccessKey, value: boolean) => void;
}

function MemberCard({
  member,
  isCurrentUser,
  currentUserIsOwner,
  busyKey,
  onRemove,
  onAccessChange,
}: MemberCardProps) {
  const name = member.display_name || member.email?.split('@')[0] || 'Usuário';
  const initials = getInitials(name);
  const isOwner = member.role === 'owner';
  const access: GroupAccess = {
    access_expenses: member.access_expenses,
    access_incomes: member.access_incomes,
    access_installments: member.access_installments,
    access_advisor: member.access_advisor,
  };

  return (
    <Card className="border-border/50 transition-shadow hover:shadow-sm">
      <CardContent className="space-y-4 pt-5">
        <div className="flex items-start gap-4">
          <Avatar className="size-12 flex-shrink-0">
            {member.avatar_url && <AvatarImage src={member.avatar_url} alt={name} />}
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
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
              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <Mail className="size-3" />
                {member.email}
              </p>
            )}
          </div>

          {currentUserIsOwner && !isCurrentUser && !isOwner && (
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive flex-shrink-0"
              onClick={() => onRemove(member.user_id, name)}
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
            <Settings2 className="size-3.5" />
            Acessos liberados
          </div>
          <AccessManager
            access={access}
            busyKey={busyKey}
            disabled={!currentUserIsOwner || isCurrentUser || isOwner}
            onToggle={(key, value) => onAccessChange(member.user_id, key, value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

interface InviteCardProps {
  invite: GroupInvite;
  busyKey: AccessKey | null;
  isRevoking: boolean;
  onAccessChange: (inviteId: string, key: AccessKey, value: boolean) => void;
  onRevoke: (inviteId: string, email: string) => void;
}

function InviteCard({
  invite,
  busyKey,
  isRevoking,
  onAccessChange,
  onRevoke,
}: InviteCardProps) {
  const access: GroupAccess = {
    access_expenses: invite.access_expenses,
    access_incomes: invite.access_incomes,
    access_installments: invite.access_installments,
    access_advisor: invite.access_advisor,
  };

  return (
    <Card className="border-border/50 bg-muted/20">
      <CardContent className="space-y-4 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">{invite.name || invite.email}</span>
              <Badge variant="outline" className="text-xs">
                Convite pendente
              </Badge>
            </div>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <Mail className="size-3" />
              {invite.email}
            </p>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Clock3 className="size-3" />
              Enviado em {formatDate(invite.created_at)}. Expira em {formatDate(invite.expires_at)}.
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
            disabled={isRevoking}
            onClick={() => onRevoke(invite.id, invite.email)}
          >
            {isRevoking ? <Loader2 className="size-4 animate-spin" /> : 'Revogar'}
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
            <Settings2 className="size-3.5" />
            Acessos quando aceitar o convite
          </div>
          <AccessManager
            access={access}
            busyKey={busyKey}
            onToggle={(key, value) => onAccessChange(invite.id, key, value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

interface InviteFormProps {
  groupId: string;
  onSuccess: () => void;
}

interface CreateGroupFormProps {
  onSuccess: (groupId: string) => void;
}

function CreateGroupForm({ onSuccess }: CreateGroupFormProps) {
  const createGroupMutation = useCreateGroup();
  const [form, setForm] = useState({
    name: '',
    type: 'shared' as 'personal' | 'shared',
  });

  function handleSubmit() {
    const result = createGroupSchema.safeParse(form);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    createGroupMutation.mutate(result.data, {
        onSuccess: (group) => {
          toast.success('Grupo criado com sucesso!');
          setForm({ name: '', type: 'shared' });
          onSuccess(group.id);
        },
      onError: (err: Error) => toast.error(err.message),
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Criar novo grupo</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="group-name">Nome do grupo</Label>
            <Input
              id="group-name"
              value={form.name}
              onChange={(e) => setForm((previous) => ({ ...previous, name: e.target.value }))}
              placeholder="Ex.: Financeiro da família"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="group-type">Tipo</Label>
            <Select
              value={form.type}
              onValueChange={(value: 'personal' | 'shared') =>
                setForm((previous) => ({ ...previous, type: value }))
              }
            >
              <SelectTrigger id="group-type" className="w-full">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="shared">Compartilhado</SelectItem>
                <SelectItem value="personal">Pessoal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Grupos compartilhados permitem convidar pessoas e definir os acessos de cada membro.
        </p>
      </CardContent>

      <CardFooter className="flex justify-end">
        <Button onClick={handleSubmit} disabled={createGroupMutation.isPending}>
          {createGroupMutation.isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Criando grupo
            </>
          ) : (
            'Criar grupo'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

function InviteForm({ groupId, onSuccess }: InviteFormProps) {
  const inviteMutation = useInviteMember(groupId);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    ...defaultGroupAccess,
  });

  function handleSubmit() {
    const result = inviteSchema.safeParse(form);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    inviteMutation.mutate(
      {
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        access_expenses: form.access_expenses,
        access_incomes: form.access_incomes,
        access_installments: form.access_installments,
        access_advisor: form.access_advisor,
      },
      {
        onSuccess: () => {
          toast.success('Convite enviado com sucesso!');
          setForm({ name: '', email: '', phone: '', ...defaultGroupAccess });
          onSuccess();
        },
        onError: (err: Error) => toast.error(err.message),
      }
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Convidar novo membro</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="invite-name">Nome</Label>
            <Input
              id="invite-name"
              value={form.name}
              onChange={(e) => setForm((previous) => ({ ...previous, name: e.target.value }))}
              placeholder="Nome completo"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="invite-phone">Telefone</Label>
            <PatternFormat
              id="invite-phone"
              value={form.phone}
              onValueChange={(value) =>
                setForm((previous) => ({ ...previous, phone: value.formattedValue }))
              }
              format="(##) #####-####"
              mask="_"
              customInput={Input}
              placeholder="(00) 00000-0000"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="invite-email">E-mail</Label>
          <Input
            id="invite-email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((previous) => ({ ...previous, email: e.target.value }))}
            placeholder="nome@exemplo.com"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Defina os acessos desse convite</p>
          <AccessManager
            access={form}
            onToggle={(key, value) =>
              setForm((previous) => ({ ...previous, [key]: value }))
            }
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

export default function Groups() {
  const { data: groups, isLoading: loadingGroups } = useGroups();
  const { data: currentUser } = useCurrentUser();
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [showCreateGroupForm, setShowCreateGroupForm] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<{ id: string; name: string } | null>(null);
  const [memberBusy, setMemberBusy] = useState<Record<string, AccessKey | null>>({});
  const [inviteBusy, setInviteBusy] = useState<Record<string, AccessKey | null>>({});
  const [revokingInviteId, setRevokingInviteId] = useState<string | null>(null);

  const isSuperAdmin = currentUser?.email === SUPER_ADMIN_EMAIL;
  const availableGroups = groups ?? [];

  useEffect(() => {
    if (!availableGroups.length) {
      setSelectedGroupId('');
      return;
    }

    const hasSelected = availableGroups.some((group) => group.id === selectedGroupId);
    if (hasSelected) return;

    const ownerGroup = availableGroups.find((group) => group.role === 'owner');
    setSelectedGroupId(ownerGroup?.id ?? availableGroups[0].id);
  }, [availableGroups, selectedGroupId]);

  const activeGroup = useMemo(
    () => availableGroups.find((group) => group.id === selectedGroupId) ?? null,
    [availableGroups, selectedGroupId]
  );
  const activeGroupId = activeGroup?.id ?? '';
  const currentUserIsOwner = activeGroup?.role === 'owner';

  const { data: members, isLoading: loadingMembers } = useGroupMembers(activeGroupId);
  const { data: invites, isLoading: loadingInvites } = useGroupInvites(
    currentUserIsOwner ? activeGroupId : undefined
  );

  const removeMutation = useRemoveMember(activeGroupId);
  const updateMemberAccessMutation = useUpdateMemberAccess(activeGroupId);
  const updateInviteAccessMutation = useUpdateInviteAccess(activeGroupId);
  const revokeInviteMutation = useRevokeInvite(activeGroupId);

  useEffect(() => {
    if (!activeGroupId) {
      setShowInviteForm(false);
    }
  }, [activeGroupId]);

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

  function handleMemberAccessChange(userId: string, key: AccessKey, value: boolean) {
    setMemberBusy((previous) => ({ ...previous, [userId]: key }));

    updateMemberAccessMutation.mutate(
      { userId, access: { [key]: value } },
      {
        onSuccess: () => toast.success('Acesso do membro atualizado.'),
        onError: (err: Error) => toast.error(err.message),
        onSettled: () => {
          setMemberBusy((previous) => ({ ...previous, [userId]: null }));
        },
      }
    );
  }

  function handleInviteAccessChange(inviteId: string, key: AccessKey, value: boolean) {
    setInviteBusy((previous) => ({ ...previous, [inviteId]: key }));

    updateInviteAccessMutation.mutate(
      { inviteId, access: { [key]: value } },
      {
        onSuccess: () => toast.success('Acesso do convite atualizado.'),
        onError: (err: Error) => toast.error(err.message),
        onSettled: () => {
          setInviteBusy((previous) => ({ ...previous, [inviteId]: null }));
        },
      }
    );
  }

  function handleRevokeInvite(inviteId: string, email: string) {
    setRevokingInviteId(inviteId);

    revokeInviteMutation.mutate(inviteId, {
      onSuccess: () => toast.success(`Convite para ${email} foi revogado.`),
      onError: (err: Error) => toast.error(err.message),
      onSettled: () => setRevokingInviteId(null),
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

  if (!activeGroup) {
    return (
      <div className="mx-auto w-full space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="space-y-2">
            <TituloPage titulo="Grupos" />
            <p className="text-sm text-muted-foreground">
              Crie seu primeiro grupo para começar a organizar pessoas e permissões.
            </p>
          </div>
          {isSuperAdmin && <Badge>Super Admin</Badge>}
        </div>

        <CreateGroupForm
          onSuccess={(groupId) => {
            setSelectedGroupId(groupId);
            setShowCreateGroupForm(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <TituloPage titulo="Grupos" />
            {isSuperAdmin && <Badge>Super Admin</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">
            Bruno pode criar grupos, adicionar pessoas e ajustar os acessos por grupo.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Select value={activeGroupId} onValueChange={setSelectedGroupId}>
            <SelectTrigger className="min-w-64">
              <SelectValue placeholder="Selecione um grupo" />
            </SelectTrigger>
            <SelectContent>
              {availableGroups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name} {group.role === 'owner' ? '• owner' : '• membro'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant={showCreateGroupForm ? 'outline' : 'default'}
            onClick={() => setShowCreateGroupForm((previous) => !previous)}
            size="sm"
          >
            {showCreateGroupForm ? 'Fechar criação' : 'Criar grupo'}
          </Button>

          {currentUserIsOwner && !showInviteForm && (
            <Button onClick={() => setShowInviteForm(true)} className="gap-2" size="sm">
              <UserPlus className="size-4" />
              Adicionar pessoa
            </Button>
          )}
        </div>
      </div>

      <Card className="border-border/50">
        <CardContent className="flex flex-col gap-2 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-medium">{activeGroup.name}</p>
            <p className="text-sm text-muted-foreground">
              Tipo: {activeGroup.type === 'shared' ? 'Compartilhado' : 'Pessoal'} • Seu papel:{' '}
              {currentUserIsOwner ? 'Owner' : 'Membro'}
            </p>
          </div>
          {!currentUserIsOwner && (
            <Badge variant="outline">Sem permissão de administração neste grupo</Badge>
          )}
        </CardContent>
      </Card>

      {showCreateGroupForm && (
        <CreateGroupForm
          onSuccess={(groupId) => {
            setSelectedGroupId(groupId);
            setShowCreateGroupForm(false);
          }}
        />
      )}

      {!currentUserIsOwner && (
        <Card className="border-border/50">
          <CardContent className="py-4 text-sm text-muted-foreground">
            Você faz parte deste grupo como membro. Apenas o owner pode convidar pessoas, remover membros
            e alterar acessos.
          </CardContent>
        </Card>
      )}

      {currentUserIsOwner && showInviteForm && (
        <InviteForm groupId={activeGroupId} onSuccess={() => setShowInviteForm(false)} />
      )}

      {currentUserIsOwner && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock3 className="size-4" />
            <span>
              {invites?.length ?? 0} {invites?.length === 1 ? 'convite pendente' : 'convites pendentes'}
            </span>
          </div>

          {loadingInvites ? (
            <>
              <MemberSkeleton />
              <MemberSkeleton />
            </>
          ) : invites?.length ? (
            invites.map((invite) => (
              <InviteCard
                key={invite.id}
                invite={invite}
                busyKey={inviteBusy[invite.id] ?? null}
                isRevoking={revokingInviteId === invite.id}
                onAccessChange={handleInviteAccessChange}
                onRevoke={handleRevokeInvite}
              />
            ))
          ) : (
            <Card className="border-border/50">
              <CardContent className="py-6 text-sm text-muted-foreground">
                Nenhum convite pendente no momento.
              </CardContent>
            </Card>
          )}
        </section>
      )}

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
        ) : members?.length ? (
          members.map((member) => (
            <MemberCard
              key={member.user_id}
              member={member}
              isCurrentUser={member.user_id === currentUser?.id}
              currentUserIsOwner={currentUserIsOwner}
              busyKey={memberBusy[member.user_id] ?? null}
              onRemove={(id, name) => setRemoveTarget({ id, name })}
              onAccessChange={handleMemberAccessChange}
            />
          ))
        ) : (
          <Card className="border-border/50">
            <CardContent className="py-6 text-sm text-muted-foreground">
              Nenhum membro foi encontrado neste grupo.
            </CardContent>
          </Card>
        )}
      </section>

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
