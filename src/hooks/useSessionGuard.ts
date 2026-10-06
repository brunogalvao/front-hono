import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { getAuthenticatedUser, supabase } from '@/lib/supabase';
import { useTranslation } from 'react-i18next';
import { useUser } from '@/context/UserContext';

export function useSessionGuard() {
  const { t } = useTranslation('nav');
  const navigate = useNavigate();
  const { setProfile } = useUser();
  const [sessionReady, setSessionReady] = useState(true);

  const redirectToLogin = useCallback(
    (showMessage: boolean) => {
      setSessionReady(false);
      setProfile(null);
      if (showMessage) toast.error(t('sessionExpired'));
      void navigate({ to: '/login' });
    },
    [navigate, setProfile, t]
  );

  useEffect(() => {
    let active = true;

    const checkSession = async (showMessage: boolean) => {
      if (document.visibilityState !== 'visible') return;
      const user = await getAuthenticatedUser();
      if (!active) return;
      if (user) {
        setSessionReady(true);
      } else {
        redirectToLogin(showMessage);
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === 'SIGNED_OUT' || !session) {
        redirectToLogin(false);
      } else {
        setSessionReady(true);
      }
    });

    const handleVisibilityChange = () => void checkSession(true);
    const handleOnline = () => void checkSession(true);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);

    return () => {
      active = false;
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
    };
  }, [redirectToLogin]);

  return { sessionReady };
}
