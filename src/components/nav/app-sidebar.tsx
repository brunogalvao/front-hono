// import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { NavMain } from '@/components/nav/nav-main';
import { SidebarUser } from '@/components/nav/sidebar-user';
import { useVersion } from '@/hooks/use-version';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { LogoIcon } from '@/components/LogoIcon';

const data = {
  navMain: [
    { title: 'Dashboard', url: '/admin/dashboard', icon: 'dashboard' as const },
    { title: 'Despesas', url: '/admin/list', icon: 'list' as const },
    { title: 'Rendimento', url: '/admin/income', icon: 'income' as const },
    { title: 'Histórico', url: '/admin/history', icon: 'history' as const },
    { title: 'Usuário', url: '/admin/editUser', icon: 'user' as const },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { getVersionString, loading } = useVersion();

  return (
    <Sidebar {...props} collapsible="offcanvas">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <LogoIcon className="size-10 shrink-0" />
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Task's Finance</span>
                  <Tooltip>
                    <TooltipTrigger className="cursor-pointer">
                      <small>version</small>
                    </TooltipTrigger>
                    <TooltipContent>
                      {loading ? 'Carregando...' : getVersionString()}
                    </TooltipContent>
                  </Tooltip>

                  {/* <span className="font-semibold">Task's Finance</span>
                  <span className="text-xs">
                    {loading ? 'Carregando...' : getVersionString()}
                  </span> */}
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
