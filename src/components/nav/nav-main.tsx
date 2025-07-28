import React from "react";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "@tanstack/react-router";
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
  const location = useLocation()
  const currentPath = location.pathname

  const isActive = (path: string) => {
    // Verifica se a rota atual corresponde exatamente ao path
    if (currentPath === path) return true
    
    // Para rotas aninhadas, verifica se o path atual começa com o path fornecido
    // Mas apenas se não for a rota raiz
    if (path !== '/' && currentPath.startsWith(path)) return true
    
    return false
  }

  return (
    <SidebarGroup className="flex space-y-4">
      <SidebarMenu>
        {items.map((item) => {
          const active = isActive(item.url)
          
          return (
            <SidebarMenuItem key={item.url}>
              <Link
                to={item.url}
                className={`flex items-center w-full text-left px-4 py-2 rounded-full transition-colors gap-2 ${
                  active
                    ? "bg-primary text-white font-semibold"
                    : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                }`}
              >
                {item.icon &&
                  (() => {
                    const Icon = iconMap[item.icon];
                    return Icon ? <Icon className="size-5" /> : null;
                  })()}
                {item.title}
              </Link>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
