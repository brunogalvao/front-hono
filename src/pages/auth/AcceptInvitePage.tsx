import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Loader2, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getAuthToken } from '@/lib/supabase';
import { API_BASE_URL } from '@/config/api';
import { queryClient } from '@/lib/query-client';
import { queryKeys } from '@/lib/query-keys';
import {
  clearWorkspaceInviteToken,
  readWorkspaceInviteToken,
} from '@/lib/workspace-invite-session';
import type {
  InviteAcceptanceResult,
  InviteErrorResult,
  InvitePreview,
} from '@/model/invite.model';
import { useCompleteProfileOnboarding } from '@/hooks/use-user-profile';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type PageState =
  | 'loading'
  | 'review'
  | 'accepting'
  | 'onboarding'
  | 'success'
  | InviteErrorResult['status'];

function isInviteError(
  result: InvitePreview | InviteAcceptanceResult | InviteErrorResult
): result is InviteErrorResult {
  return [
    'invalid',
    'expired',
    'cancelled',
    'already_accepted',
    'email_mismatch',
    'failed',
  ].includes(result.status);
}

async function inviteOperation(
  operation: 'preview' | 'accept',
  token: string
): Promise<InvitePreview | InviteAcceptanceResult | InviteErrorResult> {
  const authToken = await getAuthToken();
  const response = await fetch(
    `${API_BASE_URL}/api/workspace-invites/operation`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ operation, token }),
    }
  );
  try {
    return (await response.json()) as
      | InvitePreview
      | InviteAcceptanceResult
      | InviteErrorResult;
  } catch {
    return { status: 'failed', error_code: 'invite_operation_failed' };
  }
}

export default function AcceptInvitePage() {
  const { t, i18n } = useTranslation('invite');
  const navigate = useNavigate();
  const completeOnboarding = useCompleteProfileOnboarding();
  const [token] = useState(() => readWorkspaceInviteToken());
  const [state, setState] = useState<PageState>('loading');
  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [fullName, setFullName] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  const finish = useCallback(
    async (workspaceId: string) => {
      localStorage.setItem('active_workspace_id', workspaceId);
      clearWorkspaceInviteToken();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.permissions.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.user.all }),
      ]);
      setState('success');
      navigate({ to: '/admin/dashboard' });
    },
    [navigate]
  );

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!token) {
        setState('invalid');
        return;
      }
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        navigate({ to: '/login', search: { redirect: '/auth/accept-invite' } });
        return;
      }
      setUserId(data.user.id);
      const result = await inviteOperation('preview', token);
      if (!active) return;
      if (result.status === 'valid') {
        setPreview(result);
        setState('review');
      } else if (isInviteError(result)) {
        setState(result.status);
      } else {
        setState('failed');
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [navigate, token]);

  const accept = async () => {
    if (!token) return;
    setState('accepting');
    const result = await inviteOperation('accept', token);
    if (isInviteError(result)) {
      setState(result.status);
      return;
    }
    if (result.status !== 'accepted' && result.status !== 'already_member') {
      setState('failed');
      return;
    }
    if (result.password_setup_required) {
      await finish(result.workspace.id);
      return;
    }
    if (result.profile_onboarding_status === 'incomplete') {
      setPreview(
        (current) =>
          current ?? {
            status: 'valid',
            workspace: result.workspace,
            inviter: { display_name: '' },
            role: result.role,
            expires_at: '',
            profile_onboarding_status: 'incomplete',
            password_setup_required: false,
          }
      );
      setState('onboarding');
      return;
    }
    await finish(result.workspace.id);
  };

  const saveOnboarding = async () => {
    if (!userId || !preview) return;
    try {
      await completeOnboarding.mutateAsync({ userId, fullName });
      await finish(preview.workspace.id);
    } catch {
      setState('onboarding');
    }
  };

  const switchAccount = async () => {
    await supabase.auth.signOut();
    navigate({ to: '/login', search: { redirect: '/auth/accept-invite' } });
  };

  const errorState = [
    'invalid',
    'expired',
    'cancelled',
    'already_accepted',
    'email_mismatch',
    'failed',
  ].includes(state);
  const errorCopy = (() => {
    switch (state) {
      case 'expired':
        return {
          title: t('states.expiredTitle'),
          description: t('states.expiredDescription'),
        };
      case 'cancelled':
        return {
          title: t('states.cancelledTitle'),
          description: t('states.cancelledDescription'),
        };
      case 'already_accepted':
        return {
          title: t('states.alreadyAcceptedTitle'),
          description: t('states.alreadyAcceptedDescription'),
        };
      case 'email_mismatch':
        return {
          title: t('states.emailMismatchTitle'),
          description: t('states.emailMismatchDescription'),
        };
      case 'failed':
        return {
          title: t('states.failedTitle'),
          description: t('states.failedDescription'),
        };
      default:
        return {
          title: t('states.invalidTitle'),
          description: t('states.invalidDescription'),
        };
    }
  })();

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        {(state === 'loading' || state === 'accepting') && (
          <CardContent
            className="flex flex-col items-center gap-4 py-10"
            aria-live="polite"
          >
            <Loader2
              aria-hidden="true"
              className="text-primary h-8 w-8 animate-spin"
            />
            <p>
              {state === 'accepting'
                ? t('review.accepting')
                : t('states.loadingDescription')}
            </p>
          </CardContent>
        )}

        {state === 'review' && preview && (
          <>
            <CardHeader>
              <ShieldCheck
                aria-hidden="true"
                className="text-primary mb-2 h-9 w-9"
              />
              <CardTitle>
                <h1>{t('review.title')}</h1>
              </CardTitle>
              <CardDescription>{t('description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <dl className="grid gap-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">
                    {t('review.workspace')}
                  </dt>
                  <dd className="font-medium">{preview.workspace.name}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">
                    {t('review.invitedBy')}
                  </dt>
                  <dd className="font-medium">
                    {preview.inviter.display_name}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t('review.role')}</dt>
                  <dd className="font-medium">{t(`roles.${preview.role}`)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">
                    {t('review.expiresAt', {
                      date: new Intl.DateTimeFormat(
                        i18n.resolvedLanguage ?? 'pt-BR',
                        {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        }
                      ).format(new Date(preview.expires_at)),
                    })}
                  </dt>
                </div>
              </dl>
              <Button className="min-h-11 w-full" onClick={accept}>
                {t('review.accept')}
              </Button>
            </CardContent>
          </>
        )}

        {state === 'onboarding' && preview && (
          <>
            <CardHeader>
              <CardTitle>
                <h1>{t('onboarding.title')}</h1>
              </CardTitle>
              <CardDescription>{t('onboarding.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invite-full-name">
                  {t('onboarding.fullName')}
                </Label>
                <Input
                  id="invite-full-name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  autoComplete="name"
                />
                {completeOnboarding.isError && (
                  <p className="text-destructive text-sm" role="alert">
                    {t('onboarding.error')}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  disabled={!fullName.trim() || completeOnboarding.isPending}
                  onClick={saveOnboarding}
                >
                  {t('onboarding.save')}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => finish(preview.workspace.id)}
                >
                  {t('onboarding.skip')}
                </Button>
              </div>
            </CardContent>
          </>
        )}

        {errorState && (
          <>
            <CardHeader>
              <CardTitle>
                <h1>{errorCopy.title}</h1>
              </CardTitle>
              <CardDescription>{errorCopy.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {state === 'email_mismatch' ? (
                <Button onClick={switchAccount}>
                  {t('states.switchAccount')}
                </Button>
              ) : (
                <Button onClick={() => navigate({ to: '/login' })}>
                  {t('page.goToLogin')}
                </Button>
              )}
            </CardContent>
          </>
        )}

        {state === 'success' && (
          <CardContent className="py-10 text-center">
            {t('states.successDescription')}
          </CardContent>
        )}
      </Card>
    </main>
  );
}
