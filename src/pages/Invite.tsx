import { useEffect, useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Users, CheckCircle, XCircle, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { getInvite, type InviteInfo } from '@/service/invite/getInvite';
import { acceptInvite } from '@/service/invite/acceptInvite';

type Status = 'loading' | 'ready' | 'error' | 'accepted';

export default function Invite() {
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
      toast.success('Bem-vindo ao grupo!');
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
              <CardTitle className="text-lg">Convite inválido</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground text-sm">
              {errorMsg}
            </CardContent>
            <CardFooter className="justify-center">
              <Button variant="outline" onClick={() => navigate({ to: '/' })}>
                Voltar ao início
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
              <CardTitle className="text-xl">Convite para o Finance</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-2 pb-2">
              <p className="text-muted-foreground text-sm">
                Você foi convidado para colaborar no grupo
              </p>
              <p className="text-xl font-semibold">"{invite.group.name}"</p>
              <p className="text-xs text-muted-foreground mt-3">
                Com acesso ao grupo você pode visualizar e adicionar{' '}
                <strong>despesas, rendimentos e compras a prazo</strong> em conjunto.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              {session === null ? (
                <Button disabled className="w-full">
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Verificando sessão...
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
                      Aceitando...
                    </>
                  ) : (
                    'Aceitar convite'
                  )}
                </Button>
              ) : (
                <>
                  <Button onClick={handleLogin} className="w-full">
                    Fazer login para aceitar
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Não tem conta?{' '}
                    <a href="/login" className="underline underline-offset-2">
                      Criar conta
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
              <CardTitle className="text-lg">Convite aceito!</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground text-sm">
              Redirecionando para o grupo...
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
