import React from "react";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavLink } from "react-router-dom";
import { FaListAlt, FaUserCog, FaHome } from "react-icons/fa";
import { MdPaid } from "react-icons/md";

// Define os ícones disponíveis e o tipo aceito
const iconMap: Record<string, React.ElementType> = {
  list: FaListAlt,
  income: MdPaid,
  user: FaUserCog,
  dashboard: FaHome,
};

type IconKey = keyof typeof iconMap;

interface NavItem {
  title: string;
  url: string;
  icon?: IconKey;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
}

export function NavMain({ items }: { items: NavItem[] }) {
  return (
    <SidebarGroup className="flex space-y-4">
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.url}>
            <NavLink
              to={item.url}
              className={({ isActive }) =>
                `flex items-center w-full text-left px-4 py-2 rounded-full transition-colors gap-2 ${
                  isActive
                    ? "bg-primary text-white font-semibold"
                    : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                }`
              }
            >
              {item.icon &&
                (() => {
                  const Icon = iconMap[item.icon];
                  return Icon ? <Icon className="size-5" /> : null;
                })()}
              {item.title}
            </NavLink>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
