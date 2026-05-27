import { useEffect, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function AcceptInvitePage() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/auth/accept-invite' });
  const token = (search as Record<string, string>).token;
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token de convite não encontrado.');
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
          setMessage('Este convite expirou. Solicite um novo convite ao administrador do workspace.');
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
            {status === 'loading' && 'Processando convite...'}
            {status === 'success' && 'Convite aceito!'}
            {status === 'expired' && 'Convite expirado'}
            {status === 'error' && 'Erro ao aceitar convite'}
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Aguarde enquanto processamos seu convite.'}
            {status === 'success' && 'Bem-vindo ao workspace! Redirecionando...'}
            {(status === 'error' || status === 'expired') && message}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'loading' && <Loader2 className="mx-auto h-8 w-8 animate-spin" />}
          {(status === 'error' || status === 'expired') && (
            <Button onClick={() => navigate({ to: '/login' })}>Ir para login</Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
