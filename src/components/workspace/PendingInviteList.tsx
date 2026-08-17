import { useTranslation } from 'react-i18next';
import { Loader2, RotateCw, X } from 'lucide-react';
import type { PendingInvite } from '@/model/workspace-member.model';
import { Button } from '@/components/ui/button';

interface PendingInviteListProps {
  invites: PendingInvite[];
  isLoading: boolean;
  busyInviteId?: string;
  onResend: (inviteId: string) => Promise<unknown>;
  onCancel: (inviteId: string) => Promise<unknown>;
}

export function PendingInviteList({
  invites,
  isLoading,
  busyInviteId,
  onResend,
  onCancel,
}: PendingInviteListProps) {
  const { t } = useTranslation('invite');

  if (isLoading) {
    return (
      <Loader2
        aria-label={t('list.loading')}
        className="text-muted-foreground h-5 w-5 animate-spin"
      />
    );
  }
  if (invites.length === 0) {
    return <p className="text-muted-foreground text-sm">{t('list.empty')}</p>;
  }

  return (
    <ul className="divide-y rounded-lg border">
      {invites.map((invite) => {
        const busy = busyInviteId === invite.id;
        const role =
          invite.role === 'super_administrador' ? 'administrador' : invite.role;
        return (
          <li
            key={invite.id}
            className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {invite.email_normalized}
              </p>
              <p className="text-muted-foreground text-xs">
                {t(`roles.${role}`)} ·{' '}
                {t(`list.delivery.${invite.delivery_status}`)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="min-h-11"
                disabled={busy}
                onClick={() => void onResend(invite.id)}
              >
                <RotateCw aria-hidden="true" className="h-4 w-4" />
                {t('form.resend')}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="min-h-11"
                disabled={busy}
                onClick={() => void onCancel(invite.id)}
              >
                <X aria-hidden="true" className="h-4 w-4" />
                {t('form.cancel')}
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
