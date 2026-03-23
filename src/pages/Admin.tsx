import { AppSidebar } from '@/components/nav/app-sidebar';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from '@tanstack/react-router';
import { LogOut } from '@/components/animate-ui/icons/log-out';
import { Loader } from '@/components/animate-ui/icons/loader';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import { RippleButton } from '@/components/animate-ui/buttons/ripple';
import { NotificationBell } from '@/components/NotificationBell';

function Admin() {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate({ to: '/login' });
    } catch (error) {
      console.error(
        'Erro ao fazer logout:',
        error instanceof Error ? error.message : 'Erro desconhecido'
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    // onAuthStateChange dispara INITIAL_SESSION assim que a sessão é resolvida
    // (inclusive após o code exchange do OAuth do GitHub via PKCE).
    // Só então marcamos sessionReady=true e renderizamos o conteúdo protegido,
    // evitando queries disparadas com token nulo.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const expiresAt = session?.expires_at ?? 0;
      const secondsLeft = expiresAt - Math.floor(Date.now() / 1000);
      console.log('[Admin] onAuthStateChange', event, { hasSession: !!session, secondsLeft });

      if (!session) {
        // Sem sessão: redireciona para login (exceto durante carregamento inicial)
        if (event !== 'INITIAL_SESSION') {
          navigate({ to: '/login' });
        }
        return;
      }

      if (
        event === 'SIGNED_IN' ||
        event === 'TOKEN_REFRESHED' ||
        event === 'USER_UPDATED'
      ) {
        console.log('[Admin] sessionReady = true via', event);
        setSessionReady(true);
      } else if (event === 'INITIAL_SESSION') {
        // Mostra o layout imediatamente, mas as queries aguardam no módulo supabase.ts
        // até que TOKEN_REFRESHED confirme que o token foi validado pelo servidor.
        console.log('[Admin] sessionReady = true via INITIAL_SESSION (layout visível, queries aguardam TOKEN_REFRESHED)');
        setSessionReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />

          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex w-full items-center justify-end gap-4">
            {sessionReady && <NotificationBell />}
            <AnimateIcon animateOnHover>
              <RippleButton
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-40 rounded-full px-6!"
              >
                {isLoggingOut ? (
                  <>
                    Saindo
                    <Loader />
                  </>
                ) : (
                  <>
                    Sair
                    <LogOut />
                  </>
                )}
              </RippleButton>
            </AnimateIcon>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="bg-muted/50 min-h-0 flex-1 overflow-auto rounded-xl px-8 py-6 md:min-h-min">
            <div className="h-full w-full">
              {sessionReady ? <Outlet /> : null}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default Admin;
