import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { readWorkspaceInviteToken } from '@/lib/workspace-invite-session';

function safeInternalRedirect(value: string | null): string | null {
  if (
    !value ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.includes('\\')
  )
    return null;
  return value;
}

const AuthCallback = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase may omit custom query parameters from redirect URLs. The
    // persisted invite token is therefore the source of truth for this flow.
    const params = new URLSearchParams(window.location.search);
    const next = safeInternalRedirect(params.get('next'));
    const stored = safeInternalRedirect(
      sessionStorage.getItem('postAuthRedirect')
    );
    if (stored) sessionStorage.removeItem('postAuthRedirect');
    const hasInviteToken = Boolean(readWorkspaceInviteToken());
    const redirectTo = (
      hasInviteToken
        ? '/auth/accept-invite'
        : (next ?? stored ?? '/admin/dashboard')
    ) as '/admin/dashboard';
    let active = true;

    // getSession waits for the client to finish processing the auth callback.
    // Using one resolution path avoids an old session winning a race against
    // the session contained in the invitation magic link.
    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      if (session) {
        navigate({ to: redirectTo });
      } else {
        navigate({ to: '/login' });
      }
    });

    // Safety timeout — if it takes more than 10s, return to login
    const timeout = setTimeout(() => {
      navigate({ to: '/login' });
    }, 10000);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="border-primary h-10 w-10 animate-spin rounded-full border-4 border-t-transparent" />
        <p className="text-muted-foreground text-sm">{t('authenticating')}</p>
      </div>
    </div>
  );
};

export default AuthCallback;
