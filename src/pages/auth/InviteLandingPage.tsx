import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react';
import {
  captureWorkspaceInviteToken,
  readWorkspaceInviteToken,
} from '@/lib/workspace-invite-session';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/config/api';

export default function InviteLandingPage() {
  const { t } = useTranslation('invite');
  const [token] = useState<string | null>(
    () =>
      captureWorkspaceInviteToken(new URL(window.location.href)) ??
      readWorkspaceInviteToken()
  );

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>
              <h1>{t('states.invalidTitle')}</h1>
            </CardTitle>
            <CardDescription>{t('states.invalidDescription')}</CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  const prepareAuthUrl = `${API_BASE_URL}/api/workspace-invites/prepare-auth`;

  return (
    <main className="flex min-h-screen items-center justify-center bg-violet-50/50 p-4 dark:bg-violet-950/10">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <ShieldCheck
            aria-hidden="true"
            className="text-primary mx-auto mb-2 h-10 w-10"
          />
          <p className="text-primary text-sm font-medium">
            {t('landing.eyebrow')}
          </p>
          <CardTitle>
            <h1>{t('landing.title')}</h1>
          </CardTitle>
          <CardDescription>{t('landing.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form method="post" action={prepareAuthUrl}>
            <input type="hidden" name="token" value={token} />
            <Button type="submit" className="min-h-11 w-full">
              {t('landing.continue')}
            </Button>
          </form>
          <p className="text-muted-foreground text-center text-xs">
            {t('landing.privacy')}
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
