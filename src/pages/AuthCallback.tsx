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
    // Resolve redirect once to avoid double-reading sessionStorage
    // Priority: 1) ?next= param in URL (email confirmation) 2) sessionStorage (OAuth) 3) dashboard
    const params = new URLSearchParams(window.location.search);
    const inviteFlow = params.get('flow') === 'workspace-invite';
    const next = safeInternalRedirect(params.get('next'));
    const stored = safeInternalRedirect(
      sessionStorage.getItem('postAuthRedirect')
    );
    if (stored) sessionStorage.removeItem('postAuthRedirect');
    const hasInviteToken = Boolean(readWorkspaceInviteToken());
    const redirectTo = (
      inviteFlow && hasInviteToken
        ? '/auth/accept-invite'
        : (next ?? stored ?? '/admin/dashboard')
    ) as '/admin/dashboard';

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate({ to: redirectTo });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate({ to: redirectTo });
      } else if (
        event === 'SIGNED_OUT' ||
        (!session && event !== 'INITIAL_SESSION')
      ) {
        navigate({ to: '/login' });
      }
    });

    // Safety timeout — if it takes more than 10s, return to login
    const timeout = setTimeout(() => {
      navigate({ to: '/login' });
    }, 10000);

    return () => {
      subscription.unsubscribe();
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
