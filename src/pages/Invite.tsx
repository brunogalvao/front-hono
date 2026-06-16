import { useEffect, useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useTranslation, Trans } from 'react-i18next';
import { toast } from 'sonner';
import { Users, CheckCircle, XCircle, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { getInvite, type InviteInfo } from '@/service/invite/getInvite';
import { acceptInvite } from '@/service/invite/acceptInvite';

type Status = 'loading' | 'ready' | 'error' | 'accepted';

export default function Invite() {
  const { t } = useTranslation('invite');
  const { token } = useParams({ strict: false }) as { token: string };
  const navigate = useNavigate();

  const [status, setStatus] = useState<Status>('loading');
  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [session, setSession] = useState<boolean | null>(null);
  const [accepting, setAccepting] = useState(false);

  // Verifica sessão
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(!!data.session);
    });
  }, []);

  // Carrega dados do convite
  useEffect(() => {
    if (!token) return;
    getInvite(token)
      .then((data) => {
        setInvite(data);
        setStatus('ready');
      })
      .catch((err: Error) => {
        setErrorMsg(err.message);
        setStatus('error');
      });
  }, [token]);

  async function handleAccept() {
    if (!token) return;
    setAccepting(true);
    try {
      await acceptInvite(token);
      setStatus('accepted');
      toast.success(t('welcome'));
      setTimeout(() => navigate({ to: '/admin/groups' }), 1500);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setAccepting(false);
    }
  }

  function handleLogin() {
    // Salva o token para redirecionar após login
    sessionStorage.setItem('pendingInviteToken', token);
    navigate({ to: '/login' });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md shadow-lg">
        {status === 'loading' && (
          <CardContent className="flex items-center justify-center py-16">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </CardContent>
        )}

        {status === 'error' && (
          <>
            <CardHeader className="text-center pb-2">
              <XCircle className="size-12 mx-auto text-destructive mb-2" />
              <CardTitle className="text-lg">{t('invalidTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground text-sm">
              {errorMsg}
            </CardContent>
            <CardFooter className="justify-center">
              <Button variant="outline" onClick={() => navigate({ to: '/' })}>
                {t('backHome')}
              </Button>
            </CardFooter>
          </>
        )}

        {status === 'ready' && invite && (
          <>
            <CardHeader className="text-center pb-2">
              <div className="size-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="size-7 text-primary" />
              </div>
              <CardTitle className="text-xl">{t('title')}</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-2 pb-2">
              <p className="text-muted-foreground text-sm">
                {t('subtitle')}
              </p>
              <p className="text-xl font-semibold">"{invite.group.name}"</p>
              <p className="text-xs text-muted-foreground mt-3">
                <Trans ns="invite" i18nKey="description" components={{ bold: <strong /> }} />
              </p>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              {session === null ? (
                <Button disabled className="w-full">
                  <Loader2 className="size-4 animate-spin mr-2" />
                  {t('checkingSession')}
                </Button>
              ) : session ? (
                <Button
                  onClick={handleAccept}
                  disabled={accepting}
                  className="w-full"
                >
                  {accepting ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      {t('accepting')}
                    </>
                  ) : (
                    t('accept')
                  )}
                </Button>
              ) : (
                <>
                  <Button onClick={handleLogin} className="w-full">
                    {t('loginToAccept')}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    {t('noAccount')}{' '}
                    <a href="/login" className="underline underline-offset-2">
                      {t('createAccount')}
                    </a>
                  </p>
                </>
              )}
            </CardFooter>
          </>
        )}

        {status === 'accepted' && (
          <>
            <CardHeader className="text-center pb-2">
              <CheckCircle className="size-12 mx-auto text-green-500 mb-2" />
              <CardTitle className="text-lg">{t('acceptedTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground text-sm">
              {t('redirecting')}
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
