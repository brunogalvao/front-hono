// import * as React from "react";
import { Logo } from '@/components/Logo';
import { useTranslation } from 'react-i18next';

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
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useVersion } from '@/hooks/use-version';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { getVersionString, loading } = useVersion();
  const { t } = useTranslation(['nav', 'common']);

  const navItems = [
    { title: t('dashboard'), url: '/admin/dashboard', icon: 'dashboard' as const },
    { title: t('expenses'), url: '/admin/expenses', icon: 'list' as const },
    { title: t('income'), url: '/admin/income', icon: 'income' as const },
    { title: t('installments'), url: '/admin/installments', icon: 'parcelas' as const },
    { title: t('history'), url: '/admin/history', icon: 'history' as const },
    { title: t('advisor'), url: '/admin/advisor', icon: 'advisor' as const },
    { title: t('groups'), url: '/admin/groups', icon: 'groups' as const },
    { title: t('profile'), url: '/admin/profile', icon: 'user' as const },
  ];

  return (
    <Sidebar {...props} collapsible="offcanvas">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <Logo size={32} showWordmark={false} />
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Task's Finance</span>
                  <Tooltip>
                    <TooltipTrigger className="cursor-pointer">
                      <small>version</small>
                    </TooltipTrigger>
                    <TooltipContent>
                      {loading ? t('common:loading') : getVersionString()}
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
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center justify-end px-2 pb-1">
          <LanguageSwitcher />
        </div>
        <SidebarUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
