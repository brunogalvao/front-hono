import React from 'react';
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Link, useLocation } from '@tanstack/react-router';
import { FaListAlt, FaUserCog, FaHome, FaHistory } from 'react-icons/fa';
import { MdPaid, MdCreditCard } from 'react-icons/md';
import { Sparkles, Users } from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  list: FaListAlt,
  income: MdPaid,
  user: FaUserCog,
  dashboard: FaHome,
  history: FaHistory,
  parcelas: MdCreditCard,
  advisor: Sparkles,
  groups: Users,
};

type IconKey = keyof typeof iconMap;

interface NavItem {
  title: string;
  url: string;
  icon?: IconKey;
}

export function NavMain({ items }: { items: NavItem[] }) {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (currentPath === path) return true;
    if (path !== '/' && currentPath.startsWith(path)) return true;
    return false;
  };

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const active = isActive(item.url);
          const Icon = item.icon ? iconMap[item.icon] : null;

          return (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton
                asChild
                isActive={active}
                tooltip={item.title}
                className={`rounded-full ${active ? 'bg-primary! text-white! font-semibold' : ''}`}
              >
                <Link to={item.url}>
                  {Icon && <Icon className="shrink-0" />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
