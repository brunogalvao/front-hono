import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Clock3, Loader2, UserPlus, Users } from 'lucide-react';
import { PatternFormat } from 'react-number-format';

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
import { defaultGroupAccess } from '@/service/groups/groupAccess';
import {
  SUPER_ADMIN_EMAIL,
  buildCreateGroupSchema,
  buildInviteSchema,
  type AccessKey,
  type GroupValidationMessages,
} from '@/features/groups/group-config';
import {
  AccessManager,
  InviteCard,
  MemberCard,
  MemberSkeleton,
} from '@/features/groups/group-member-cards';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface InviteFormProps {
  groupId: string;
  onSuccess: () => void;
}

interface CreateGroupFormProps {
  onSuccess: (groupId: string) => void;
}

function CreateGroupForm({ onSuccess }: CreateGroupFormProps) {
  const { t } = useTranslation('groups');
  const createGroupMutation = useCreateGroup();
  const validationMessages = useMemo<GroupValidationMessages>(
    () => ({
      nameRequired: t('validation.nameRequired'),
      emailInvalid: t('validation.emailInvalid'),
      phoneInvalid: t('validation.phoneInvalid'),
      groupNameRequired: t('validation.groupNameRequired'),
    }),
    [t]
  );
  const createGroupSchema = useMemo(
    () => buildCreateGroupSchema(validationMessages),
    [validationMessages]
  );
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
        toast.success(t('toast.created'));
        setForm({ name: '', type: 'shared' });
        onSuccess(group.id);
      },
      onError: (err: Error) => {
        console.error('Group creation failed', err);
        toast.error(t('toast.createError'));
      },
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('create.title')}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="group-name">{t('create.name')}</Label>
            <Input
              id="group-name"
              value={form.name}
              onChange={(e) =>
                setForm((previous) => ({ ...previous, name: e.target.value }))
              }
              placeholder={t('create.namePlaceholder')}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="group-type">{t('create.type')}</Label>
            <Select
              value={form.type}
              onValueChange={(value: 'personal' | 'shared') =>
                setForm((previous) => ({ ...previous, type: value }))
              }
            >
              <SelectTrigger id="group-type" className="w-full">
                <SelectValue placeholder={t('create.typePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="shared">{t('create.shared')}</SelectItem>
                <SelectItem value="personal">{t('create.personal')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <p className="text-muted-foreground text-sm">
          {t('create.description')}
        </p>
      </CardContent>

      <CardFooter className="flex justify-end">
        <Button onClick={handleSubmit} disabled={createGroupMutation.isPending}>
          {createGroupMutation.isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              {t('create.submitting')}
            </>
          ) : (
            t('create.submit')
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

function InviteForm({ groupId, onSuccess }: InviteFormProps) {
  const { t } = useTranslation('groups');
  const inviteMutation = useInviteMember(groupId);
  const validationMessages = useMemo<GroupValidationMessages>(
    () => ({
      nameRequired: t('validation.nameRequired'),
      emailInvalid: t('validation.emailInvalid'),
      phoneInvalid: t('validation.phoneInvalid'),
      groupNameRequired: t('validation.groupNameRequired'),
    }),
    [t]
  );
  const inviteSchema = useMemo(
    () => buildInviteSchema(validationMessages),
    [validationMessages]
  );
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
          toast.success(t('toast.invited'));
          setForm({ name: '', email: '', phone: '', ...defaultGroupAccess });
          onSuccess();
        },
        onError: (err: Error) => {
          console.error('Group invitation failed', err);
          toast.error(t('toast.inviteError'));
        },
      }
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('invite.title')}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="invite-name">{t('invite.name')}</Label>
            <Input
              id="invite-name"
              value={form.name}
              onChange={(e) =>
                setForm((previous) => ({ ...previous, name: e.target.value }))
              }
              placeholder={t('invite.namePlaceholder')}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="invite-phone">{t('invite.phone')}</Label>
            <PatternFormat
              id="invite-phone"
              value={form.phone}
              onValueChange={(value) =>
                setForm((previous) => ({
                  ...previous,
                  phone: value.formattedValue,
                }))
              }
              format="(##) #####-####"
              mask="_"
              customInput={Input}
              placeholder={t('invite.phonePlaceholder')}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="invite-email">{t('invite.email')}</Label>
          <Input
            id="invite-email"
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm((previous) => ({ ...previous, email: e.target.value }))
            }
            placeholder={t('invite.emailPlaceholder')}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">{t('invite.access')}</p>
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
                  {t('invite.submitting')}
                  <Loader2 className="size-4 animate-spin" />
                </>
              ) : (
                <>
                  {t('invite.submit')}
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
  const { t } = useTranslation('groups');
  const { data: groups, isLoading: loadingGroups } = useGroups();
  const { data: currentUser } = useCurrentUser();
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [showCreateGroupForm, setShowCreateGroupForm] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [memberBusy, setMemberBusy] = useState<
    Record<string, AccessKey | null>
  >({});
  const [inviteBusy, setInviteBusy] = useState<
    Record<string, AccessKey | null>
  >({});
  const [revokingInviteId, setRevokingInviteId] = useState<string | null>(null);

  const isSuperAdmin = currentUser?.email === SUPER_ADMIN_EMAIL;
  const availableGroups = useMemo(() => groups ?? [], [groups]);

  useEffect(() => {
    if (!availableGroups.length) {
      setSelectedGroupId('');
      return;
    }

    const hasSelected = availableGroups.some(
      (group) => group.id === selectedGroupId
    );
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

  const { data: members, isLoading: loadingMembers } =
    useGroupMembers(activeGroupId);
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
        toast.success(t('toast.removed'));
        setRemoveTarget(null);
      },
      onError: (err: Error) => {
        console.error('Group member removal failed', err);
        toast.error(t('toast.removeError'));
      },
    });
  }

  function handleMemberAccessChange(
    userId: string,
    key: AccessKey,
    value: boolean
  ) {
    setMemberBusy((previous) => ({ ...previous, [userId]: key }));

    updateMemberAccessMutation.mutate(
      { userId, access: { [key]: value } },
      {
        onSuccess: () => toast.success(t('toast.memberAccessUpdated')),
        onError: (err: Error) => {
          console.error('Group member access update failed', err);
          toast.error(t('toast.genericError'));
        },
        onSettled: () => {
          setMemberBusy((previous) => ({ ...previous, [userId]: null }));
        },
      }
    );
  }

  function handleInviteAccessChange(
    inviteId: string,
    key: AccessKey,
    value: boolean
  ) {
    setInviteBusy((previous) => ({ ...previous, [inviteId]: key }));

    updateInviteAccessMutation.mutate(
      { inviteId, access: { [key]: value } },
      {
        onSuccess: () => toast.success(t('toast.inviteAccessUpdated')),
        onError: (err: Error) => {
          console.error('Group invitation access update failed', err);
          toast.error(t('toast.genericError'));
        },
        onSettled: () => {
          setInviteBusy((previous) => ({ ...previous, [inviteId]: null }));
        },
      }
    );
  }

  function handleRevokeInvite(inviteId: string, email: string) {
    setRevokingInviteId(inviteId);

    revokeInviteMutation.mutate(inviteId, {
      onSuccess: () => toast.success(t('toast.inviteRevoked', { email })),
      onError: (err: Error) => {
        console.error('Group invitation revoke failed', err);
        toast.error(t('toast.genericError'));
      },
      onSettled: () => setRevokingInviteId(null),
    });
  }

  if (loadingGroups) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-7 w-40" />
        <MemberSkeleton />
        <MemberSkeleton />
      </div>
    );
  }

  if (!activeGroup) {
    return (
      <div className="mx-auto w-full space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <TituloPage titulo={t('title')} />
            <p className="text-muted-foreground text-sm">{t('subtitle')}</p>
          </div>
          {isSuperAdmin && <Badge>{t('superAdmin')}</Badge>}
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <TituloPage titulo={t('title')} />
            {isSuperAdmin && <Badge>{t('superAdmin')}</Badge>}
          </div>
          <p className="text-muted-foreground text-sm">{t('subtitle')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={activeGroupId} onValueChange={setSelectedGroupId}>
            <SelectTrigger className="min-w-64">
              <SelectValue placeholder={t('selectorPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {availableGroups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name} •{' '}
                  {group.role === 'owner'
                    ? t('roles.owner')
                    : t('roles.member')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant={showCreateGroupForm ? 'outline' : 'default'}
            onClick={() => setShowCreateGroupForm((previous) => !previous)}
            size="sm"
          >
            {showCreateGroupForm ? t('create.close') : t('create.open')}
          </Button>

          {currentUserIsOwner && !showInviteForm && (
            <Button
              onClick={() => setShowInviteForm(true)}
              className="gap-2"
              size="sm"
            >
              <UserPlus className="size-4" />
              {t('addPerson')}
            </Button>
          )}
        </div>
      </div>

      <Card className="border-border/50">
        <CardContent className="flex flex-col gap-2 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-medium">{activeGroup.name}</p>
            <p className="text-muted-foreground text-sm">
              {t('groupSummary', {
                type:
                  activeGroup.type === 'shared'
                    ? t('create.shared')
                    : t('create.personal'),
                role: currentUserIsOwner ? t('roles.owner') : t('roles.member'),
              })}
            </p>
          </div>
          {!currentUserIsOwner && (
            <Badge variant="outline">{t('noAdminPermission')}</Badge>
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
          <CardContent className="text-muted-foreground py-4 text-sm">
            {t('memberOnlyDescription')}
          </CardContent>
        </Card>
      )}

      {currentUserIsOwner && showInviteForm && (
        <InviteForm
          groupId={activeGroupId}
          onSuccess={() => setShowInviteForm(false)}
        />
      )}

      {currentUserIsOwner && (
        <section className="space-y-3">
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Clock3 className="size-4" />
            <span>{t('pendingCount', { count: invites?.length ?? 0 })}</span>
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
              <CardContent className="text-muted-foreground py-6 text-sm">
                {t('noPendingInvites')}
              </CardContent>
            </Card>
          )}
        </section>
      )}

      <section className="space-y-3">
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Users className="size-4" />
          <span>{t('memberCount', { count: members?.length ?? 0 })}</span>
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
            <CardContent className="text-muted-foreground py-6 text-sm">
              {t('noMembersInGroup')}
            </CardContent>
          </Card>
        )}
      </section>

      <AlertDialog
        open={!!removeTarget}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('removeDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('removeDialog.description', {
                name: removeTarget?.name ?? '',
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('removeDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('removeDialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
