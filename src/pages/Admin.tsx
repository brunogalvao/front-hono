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
import { Outlet, useNavigate } from "react-router-dom";

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
        error instanceof Error ? error.message : "Erro desconhecido",
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
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
          <Button
            className="cursor-pointer"
            variant="outline"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "Saindo..." : "Sair"}
          </Button>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min px-8 py-6">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default Admin;
