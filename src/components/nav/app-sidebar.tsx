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
import { useWorkspace } from '@/context/WorkspaceContext';
import { useTranslation } from 'react-i18next';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { can, isSuperAdmin } = usePermissions();
  const { activeWorkspace } = useWorkspace();
  const { t } = useTranslation('nav');
  const canReadTransactions = can('transactions', 'read');
  const canReadMembers = can('members', 'read');
  const canReadPermissions = isSuperAdmin || can('permissions', 'read');

  const navItems: NavItem[] = [
    ...(canReadTransactions
      ? [
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
        ]
      : []),
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
    ...(canReadTransactions
      ? [
          {
            title: t('insights'),
            url: '/admin/advisor',
            icon: 'advisor' as const,
          },
        ]
      : []),
    ...(activeWorkspace
      ? [
          {
            type: 'group' as const,
            title: t('settings'),
            icon: 'account' as const,
            children: [
              {
                title: t('settingsSubmenu.workspaces'),
                url: '/admin/settings',
                icon: 'sliders' as const,
                exact: true,
              },
              ...(canReadMembers
                ? [
                    {
                      title: t('settingsSubmenu.members'),
                      url: '/admin/settings/members',
                      icon: 'groups' as const,
                    },
                  ]
                : []),
              ...(canReadPermissions
                ? [
                    {
                      title: t('settingsSubmenu.permissions'),
                      url: '/admin/settings/permissions',
                      icon: 'crown' as const,
                    },
                  ]
                : []),
            ],
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
