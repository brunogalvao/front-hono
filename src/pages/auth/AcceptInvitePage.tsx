import { useEffect, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function AcceptInvitePage() {
  const { t } = useTranslation('invite');
  const navigate = useNavigate();
  const search = useSearch({ from: '/auth/accept-invite' });
  const token = (search as Record<string, string>).token;
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage(t('page.noToken'));
      return;
    }

    let done = false;

    const accept = async (accessToken: string) => {
      if (done) return;
      done = true;

      // Explicitly pass the access token so the edge function always
      // receives a valid Authorization header regardless of client timing.
      const { data, error } = await supabase.functions.invoke('accept-invite', {
        body: { token },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Extract the real error message from the response body when non-2xx
      let errorMsg: string | null = null;
      if (error) {
        try {
          const body = await (error as { context?: Response }).context?.json();
          errorMsg = body?.error ?? error.message;
        } catch {
          errorMsg = error.message;
        }
      } else if (data?.error) {
        errorMsg = data.error;
      }

      if (errorMsg) {
        if (errorMsg.includes('expired') || errorMsg.includes('expirado')) {
          setStatus('expired');
          setMessage(t('page.expiredMessage'));
        } else {
          setStatus('error');
          setMessage(errorMsg);
        }
        return;
      }

      setStatus('success');
      setTimeout(() => navigate({ to: '/admin/dashboard' }), 2000);
    };

    // Try immediately — session should already be set if coming from AuthCallback
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token) {
        accept(session.access_token);
        return;
      }

      // Fallback: session not ready yet, wait for SIGNED_IN
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session?.access_token) {
          subscription.unsubscribe();
          clearTimeout(timeout);
          accept(session.access_token);
        } else if (event === 'SIGNED_OUT') {
          subscription.unsubscribe();
          clearTimeout(timeout);
          navigate({ to: '/login', search: { redirect: `/auth/accept-invite?token=${token}` } });
        }
      });

      // Safety timeout — 10s without session → back to login
      const timeout = setTimeout(() => {
        subscription.unsubscribe();
        if (!done) {
          navigate({ to: '/login', search: { redirect: `/auth/accept-invite?token=${token}` } });
        }
      }, 10000);
    });
  }, [token, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>
            {status === 'loading' && t('page.processing')}
            {status === 'success' && t('acceptedTitle')}
            {status === 'expired' && t('page.expiredTitle')}
            {status === 'error' && t('page.errorTitle')}
          </CardTitle>
          <CardDescription>
            {status === 'loading' && t('page.processingDesc')}
            {status === 'success' && t('page.successDesc')}
            {(status === 'error' || status === 'expired') && message}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'loading' && <Loader2 className="mx-auto h-8 w-8 animate-spin" />}
          {(status === 'error' || status === 'expired') && (
            <Button onClick={() => navigate({ to: '/login' })}>{t('page.goToLogin')}</Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
