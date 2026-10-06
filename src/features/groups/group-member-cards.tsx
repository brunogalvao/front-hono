import { useTranslation } from 'react-i18next';
import { Clock3, Loader2, Mail, Settings2, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import type { GroupAccess } from '@/service/groups/groupAccess';
import type { GroupInvite } from '@/service/groups/getGroupInvites';
import type { GroupMember } from '@/service/groups/getGroupMembers';
import { getInitials } from '@/utils/getInitials';
import {
  ACCESS_OPTIONS,
  formatGroupDate,
  type AccessKey,
} from '@/features/groups/group-config';

export function MemberSkeleton() {
  return (
    <Card className="border-border/50">
      <CardContent className="flex items-start gap-4 pt-5">
        <Skeleton className="size-12 flex-shrink-0 rounded-full" />
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

export function AccessManager({
  access,
  disabled = false,
  busyKey = null,
  onToggle,
}: AccessManagerProps) {
  const { t } = useTranslation('groups');

  return (
    <div className="grid gap-2 md:grid-cols-2">
      {ACCESS_OPTIONS.map((option) => {
        const checked = access[option.key];
        const isBusy = busyKey === option.key;

        return (
          <div
            key={option.key}
            className="border-border/60 flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium">
                <span className="mr-1">{option.icon}</span>
                {t(option.labelKey)}
              </p>
              <p className="text-muted-foreground text-xs">
                {t(option.descriptionKey)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {isBusy && (
                <Loader2 className="text-muted-foreground size-4 animate-spin" />
              )}
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

export function MemberCard({
  member,
  isCurrentUser,
  currentUserIsOwner,
  busyKey,
  onRemove,
  onAccessChange,
}: MemberCardProps) {
  const { t } = useTranslation('groups');
  const name =
    member.display_name || member.email?.split('@')[0] || t('userFallback');
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
            {member.avatar_url && (
              <AvatarImage src={member.avatar_url} alt={name} />
            )}
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate text-sm font-semibold">{name}</span>
              {isCurrentUser && (
                <Badge variant="outline" className="px-1.5 py-0 text-xs">
                  {t('currentUser')}
                </Badge>
              )}
              <Badge
                className={`px-2 py-0.5 text-xs ${
                  isOwner
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {isOwner ? t('roles.owner') : t('roles.member')}
              </Badge>
            </div>

            {member.email && (
              <p className="text-muted-foreground mt-0.5 flex items-center gap-1 text-xs">
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
          <div className="text-muted-foreground flex items-center gap-2 text-xs tracking-wide uppercase">
            <Settings2 className="size-3.5" />
            {t('accessReleased')}
          </div>
          <AccessManager
            access={access}
            busyKey={busyKey}
            disabled={!currentUserIsOwner || isCurrentUser || isOwner}
            onToggle={(key, value) =>
              onAccessChange(member.user_id, key, value)
            }
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

export function InviteCard({
  invite,
  busyKey,
  isRevoking,
  onAccessChange,
  onRevoke,
}: InviteCardProps) {
  const { t, i18n } = useTranslation('groups');
  const dateLocale = i18n.resolvedLanguage === 'en' ? 'en-US' : 'pt-BR';
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
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold">
                {invite.name || invite.email}
              </span>
              <Badge variant="outline" className="text-xs">
                {t('pendingInvite')}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-0.5 flex items-center gap-1 text-xs">
              <Mail className="size-3" />
              {invite.email}
            </p>
            <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
              <Clock3 className="size-3" />
              {t('inviteDates', {
                createdAt: formatGroupDate(invite.created_at, dateLocale),
                expiresAt: formatGroupDate(invite.expires_at, dateLocale),
              })}
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
            disabled={isRevoking}
            onClick={() => onRevoke(invite.id, invite.email)}
          >
            {isRevoking ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              t('revoke')
            )}
          </Button>
        </div>

        <div className="space-y-2">
          <div className="text-muted-foreground flex items-center gap-2 text-xs tracking-wide uppercase">
            <Settings2 className="size-3.5" />
            {t('inviteAccess')}
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
