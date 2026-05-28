import React from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { Link, useLocation } from '@tanstack/react-router';
import { FaListAlt, FaUserCog, FaHome, FaHistory } from 'react-icons/fa';
import { MdPaid, MdCreditCard } from 'react-icons/md';
import { Sparkles, Users, ChevronRight, UserRound, Settings, ShieldCheck } from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  list: FaListAlt,
  income: MdPaid,
  user: FaUserCog,
  dashboard: FaHome,
  history: FaHistory,
  parcelas: MdCreditCard,
  advisor: Sparkles,
  groups: Users,
  profile: UserRound,
  account: Settings,
  shield: ShieldCheck,
};

type IconKey = keyof typeof iconMap;

interface NavLeafItem {
  title: string;
  url: string;
  icon?: IconKey;
  type?: 'leaf';
}

interface NavGroupItem {
  title: string;
  icon?: IconKey;
  type: 'group';
  children: NavLeafItem[];
}

export type NavItem = NavLeafItem | NavGroupItem;

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
          if (item.type === 'group') {
            const Icon = item.icon ? iconMap[item.icon] : null;
            const anyChildActive = item.children.some((c) => isActive(c.url));

            return (
              <Collapsible
                key={item.title}
                defaultOpen={anyChildActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={anyChildActive}
                      className={`rounded-full ${anyChildActive ? 'bg-primary/10 font-semibold' : ''}`}
                    >
                      {Icon && <Icon className="shrink-0" />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.children.map((child) => {
                        const ChildIcon = child.icon ? iconMap[child.icon] : null;
                        const childActive = isActive(child.url);
                        return (
                          <SidebarMenuSubItem key={child.url}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={childActive}
                              className={childActive ? 'text-primary font-semibold' : ''}
                            >
                              <Link to={child.url}>
                                {ChildIcon && <ChildIcon className="shrink-0" />}
                                <span>{child.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          }

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
