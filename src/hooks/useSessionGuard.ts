import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export function useSessionGuard() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      if (document.visibilityState !== 'visible') return;

      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        toast.error('Sessão expirada. Faça login novamente.');
        navigate({ to: '/login' });
      }
    };

    const handleVisibilityChange = () => checkSession();
    const handleOnline = () => checkSession();

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
    };
  }, [navigate]);
}
