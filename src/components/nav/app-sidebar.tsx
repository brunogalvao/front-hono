import { useQuery } from '@tanstack/react-query';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import { NavMain, type NavItem } from '@/components/nav/nav-main';
import { SidebarUser } from '@/components/nav/sidebar-user';
import { WorkspaceSwitcher } from '@/components/nav/WorkspaceSwitcher';
import { useWorkspace } from '@/context/WorkspaceContext';
import { canWrite, canManageMembers, isSuperuser } from '@/lib/permissions';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';

function useCurrentUserId() {
  return useQuery({
    queryKey: queryKeys.auth.session(),
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user?.id ?? null;
    },
  });
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { activeRole, activeWorkspace } = useWorkspace();
  const { data: currentUserId } = useCurrentUserId();

  const isSuperAdmin =
    !!activeWorkspace && !!currentUserId && isSuperuser(activeWorkspace.superuser_id, currentUserId);

  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      url: '/admin/dashboard',
      icon: 'dashboard' as const,
    },
    {
      title: 'Transações',
      url: '/admin/transactions',
      icon: 'list' as const,
    },
    ...(canWrite(activeRole)
      ? [
          {
            title: 'Recorrências',
            url: '/admin/recurring',
            icon: 'income' as const,
          },
        ]
      : []),
    ...(canWrite(activeRole)
      ? [
          {
            title: 'Parcelamentos',
            url: '/admin/installments',
            icon: 'parcelas' as const,
          },
        ]
      : []),
    {
      title: 'Insights IA',
      url: '/admin/insights',
      icon: 'advisor' as const,
    },
    ...(canManageMembers(activeRole)
      ? [
          {
            title: 'Configurações',
            url: '/admin/settings',
            icon: 'groups' as const,
            exact: true,
          },
        ]
      : []),
    ...(isSuperAdmin
      ? [
          {
            title: 'Permissões',
            url: '/admin/settings/members',
            icon: 'shield' as const,
          },
        ]
      : []),
    {
      type: 'group' as const,
      title: 'Meu Espaço',
      icon: 'profile' as const,
      children: [
        {
          title: 'Perfil',
          url: '/admin/profile',
          icon: 'profile' as const,
        },
        {
          title: 'Minha Conta',
          url: '/admin/account',
          icon: 'account' as const,
        },
      ],
    },
  ];

  return (
    <Sidebar {...props} collapsible="icon">
      <SidebarHeader>
        <WorkspaceSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
