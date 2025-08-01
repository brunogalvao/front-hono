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

function Admin() {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
    // const logToken = async () => {
    //   const { data, error } = await supabase.auth.getSession();
    //   if (error) {
    //     console.error("❌ Erro ao obter sessão:", error);
    //     return;
    //   }

    //   const token = data.session?.access_token;
    //   console.log("🔑 Access Token:");
    //   console.log(token); // isso evita corte
    // };

    // logToken();

    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate({ to: '/login' });
      } else {
        console.log('Usuário autenticado:', session.user.email);
      }
    };

    const setupAuthListener = () => {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!session) {
          navigate({ to: '/login' });
        }
      });
      return subscription;
    };

    checkUser();

    const subscription = setupAuthListener();

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />

          <Separator orientation="vertical" className="mr-2 h-4" />
          {/* sair */}
          <div className="flex w-full justify-end">
            <AnimateIcon animateOnHover>
              <RippleButton
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-40"
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
              <Outlet />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default Admin;
