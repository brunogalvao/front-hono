import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavLink } from "react-router-dom";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  return (
    <SidebarGroup className="flex space-y-4">
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.url}>
            <NavLink
              to={item.url}
              className={({ isActive }) =>
                `flex w-full text-left px-4 py-2 rounded-md transition-colors ${
                  isActive
                    ? "bg-muted text-primary font-semibold"
                    : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                }`
              }
            >
              {item.title}
            </NavLink>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
