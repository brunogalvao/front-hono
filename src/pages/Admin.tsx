import { AppSidebar } from "@/components/nav/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { LogOut } from "@/components/animate-ui/icons/log-out";
import { Loader } from "@/components/animate-ui/icons/loader";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";

function Admin() {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/login");
    } catch (error) {
      console.error(
        "Erro ao fazer logout:",
        error instanceof Error ? error.message : "Erro desconhecido"
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
        navigate("/login");
      }
    };

    const setupAuthListener = () => {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!session) {
          navigate("/login");
        }
      });
      return subscription;
    };

    const subscription = setupAuthListener();

    return () => subscription.unsubscribe();

    checkUser();
  }, [navigate]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />

          <Separator orientation="vertical" className="mr-2 h-4" />
          {/* sair */}
          <div className="flex justify-end w-full">
            <Button
              className="cursor-pointer flex gap-3"
              variant="outline"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <>
                  Saindo
                  <AnimateIcon animateOnHover>
                    <Loader />
                  </AnimateIcon>
                </>
              ) : (
                <>
                  Sair
                  <AnimateIcon animateOnHover>
                    <LogOut />
                  </AnimateIcon>
                </>
              )}
            </Button>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <Link to="/" onClick={handleLogout}>
            <LogOut animateOnHover />
          </Link>

          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min px-8 py-6">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default Admin;
