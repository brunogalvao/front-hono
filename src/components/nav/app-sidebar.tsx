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
import { useTranslation } from 'react-i18next';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { can, isSuperAdmin } = usePermissions();
  const { t } = useTranslation('nav');

  const navItems: NavItem[] = [
    {
      title: t('dashboard'),
      url: '/admin/dashboard',
      icon: 'dashboard' as const,
    },
    {
      title: t('transactions'),
      url: '/admin/transactions',
      icon: 'list' as const,
    },
    ...(can('recurring', 'read')
      ? [
          {
            title: t('recurring'),
            url: '/admin/recurring',
            icon: 'income' as const,
          },
        ]
      : []),
    ...(can('installments', 'read')
      ? [
          {
            title: t('installments'),
            url: '/admin/installments',
            icon: 'parcelas' as const,
          },
        ]
      : []),
    {
      title: t('insights'),
      url: '/admin/advisor',
      icon: 'advisor' as const,
    },
    ...(can('settings', 'read')
      ? [
          {
            title: t('settings'),
            url: '/admin/settings',
            icon: 'groups' as const,
            exact: true,
          },
        ]
      : []),
    ...(can('members', 'read')
      ? [
          {
            title: isSuperAdmin ? t('permissions') : t('members'),
            url: '/admin/settings/members',
            icon: 'shield' as const,
          },
        ]
      : []),
    {
      type: 'group' as const,
      title: t('mySpace'),
      icon: 'profile' as const,
      children: [
        {
          title: t('profile'),
          url: '/admin/profile',
          icon: 'profile' as const,
        },
        {
          title: t('account'),
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
