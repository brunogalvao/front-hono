import { useEffect, useState } from 'react';
import { getUser } from '@/service/userService';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { getInitials } from '@/utils/getInitials';
import type { UserProfile } from '@/model/user.model';
import { useUser } from '@/hooks/useUser';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronsUpDown, Bell, LogOut } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getTasksPendentes } from '@/service/task/getTasksPendentes';
import { AnimatedThemeToggle } from '@/components/theme-toggle-animated';
import { AnimatedLanguageToggle } from '@/components/language-toggle-animated';

export function SidebarUser() {
  const [fetchedProfile, setFetchedProfile] = useState<UserProfile | null>(null);
  const { profile } = useUser();
  const navigate = useNavigate();

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const { data: pendentes = [] } = useQuery({
    queryKey: queryKeys.notifications.pending(month, year),
    queryFn: () => getTasksPendentes({ month, year }),
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const userData = await getUser();
        setFetchedProfile(userData);
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      }
    };
    load();
  }, []);

  const fullProfile = profile || fetchedProfile;
  if (!fullProfile) return null;

  const displayName = fullProfile.displayName || fullProfile.name || '';
  const email = fullProfile.email || '';
  const nameOrEmail = displayName || email;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: '/login' });
  };

  const notifCount = pendentes.length;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              tooltip={nameOrEmail}
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 shrink-0 rounded-full">
                <AvatarImage src={fullProfile.avatar_url} />
                <AvatarFallback>{getInitials(nameOrEmail)}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                {displayName && (
                  <span className="truncate font-semibold">{displayName}</span>
                )}
                <span className="truncate text-xs text-muted-foreground">
                  {email}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 shrink-0" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="min-w-64 rounded-lg"
            side="top"
            align="end"
            sideOffset={4}
          >
            {/* User info */}
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5">
                <Avatar className="h-8 w-8 shrink-0 rounded-full">
                  <AvatarImage src={fullProfile.avatar_url} />
                  <AvatarFallback>{getInitials(nameOrEmail)}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  {displayName && (
                    <span className="truncate font-semibold">{displayName}</span>
                  )}
                  <span className="truncate text-xs text-muted-foreground">
                    {email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {/* Notificações */}
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => navigate({ to: '/admin/expenses' })}
              >
                <Bell className="size-4" />
                <span>Notificações</span>
                {notifCount > 0 && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {notifCount > 9 ? '9+' : notifCount}
                  </span>
                )}
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* Tema animado */}
            <DropdownMenuGroup>
              <div className="px-2 py-2">
                <AnimatedThemeToggle />
              </div>

              {/* Idioma */}
              <div className="px-2 py-2">
                <AnimatedLanguageToggle />
              </div>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* Logout */}
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-500 focus:text-red-500"
            >
              <LogOut className="size-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
