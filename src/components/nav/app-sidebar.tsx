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
import { usePermissions } from '@/hooks/usePermissions';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { can, isSuperAdmin } = usePermissions();

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
    ...(can('recurring', 'read')
      ? [{ title: 'Recorrências', url: '/admin/recurring', icon: 'income' as const }]
      : []),
    ...(can('installments', 'read')
      ? [{ title: 'Parcelamentos', url: '/admin/installments', icon: 'parcelas' as const }]
      : []),
    {
      title: 'Insights IA',
      url: '/admin/insights',
      icon: 'advisor' as const,
    },
    ...(can('settings', 'read')
      ? [{ title: 'Configurações', url: '/admin/settings', icon: 'groups' as const, exact: true }]
      : []),
    ...(can('members', 'read')
      ? [
          {
            title: isSuperAdmin ? 'Permissões' : 'Membros',
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
        { title: 'Perfil', url: '/admin/profile', icon: 'profile' as const },
        { title: 'Minha Conta', url: '/admin/account', icon: 'account' as const },
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
