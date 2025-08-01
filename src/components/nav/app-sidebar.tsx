// import * as React from "react";
import { GalleryVerticalEnd } from 'lucide-react';

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

const data = {
  navMain: [
    { title: 'Dashboard', url: '/admin/dashboard', icon: 'dashboard' as const },
    { title: 'Lista', url: '/admin/list', icon: 'list' as const },
    { title: 'Rendimento', url: '/admin/income', icon: 'income' as const },
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
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-12 items-center justify-center rounded-full">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Task's Finance</span>
                  <span className="text-xs">
                    {loading ? 'Carregando...' : getVersionString()}
                  </span>
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
