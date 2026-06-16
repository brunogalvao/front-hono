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

    const accept = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        navigate({ to: '/login', search: { redirect: `/auth/accept-invite?token=${token}` } });
        return;
      }

      const { data, error } = await supabase.functions.invoke('accept-invite', {
        body: { token },
      });

      if (error || data?.error) {
        const msg = data?.error ?? error?.message ?? 'Erro desconhecido';
        if (msg.includes('expired') || msg.includes('expirado')) {
          setStatus('expired');
          setMessage(t('page.expiredMessage'));
        } else {
          setStatus('error');
          setMessage(msg);
        }
        return;
      }

      setStatus('success');
      setTimeout(() => navigate({ to: '/admin/dashboard' }), 2000);
    };

    accept();
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
