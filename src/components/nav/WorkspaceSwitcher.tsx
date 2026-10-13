import { ChevronsUpDown, Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useWorkspace } from '@/context/WorkspaceContext';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useCurrentUser } from '@/hooks/use-user-profile';
import { CreateWorkspaceDialog } from '@/components/workspace/CreateWorkspaceDialog';

export function WorkspaceSwitcher() {
  const { t } = useTranslation('nav');
  const { isMobile } = useSidebar();
  const { activeWorkspace, workspaces, switchWorkspace } = useWorkspace();
  const { data: currentUser } = useCurrentUser();
  const [createOpen, setCreateOpen] = useState(false);
  const canCreateWorkspace = workspaces.some(
    (workspace) => workspace.superuser_id === currentUser?.id
  );

  if (!activeWorkspace) return null;

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg text-sm font-bold">
                  {activeWorkspace.name.charAt(0).toUpperCase()}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {activeWorkspace.name}
                  </span>
                  <span className="text-muted-foreground truncate text-xs capitalize">
                    {t(`roles.${activeWorkspace.role}`, {
                      defaultValue: activeWorkspace.role,
                    })}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              align="start"
              side={isMobile ? 'bottom' : 'right'}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                {t('workspaces')}
              </DropdownMenuLabel>
              {workspaces.map((ws) => (
                <DropdownMenuItem
                  key={ws.id}
                  onClick={() => switchWorkspace(ws.id)}
                  className={cn(
                    'gap-2 p-2',
                    ws.id === activeWorkspace.id &&
                      'bg-accent text-accent-foreground'
                  )}
                >
                  <div className="flex size-6 items-center justify-center rounded-sm border text-xs font-bold">
                    {ws.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="flex-1 truncate">{ws.name}</span>
                  <span className="text-muted-foreground text-xs capitalize">
                    {t(`roles.${ws.role}`, { defaultValue: ws.role })}
                  </span>
                </DropdownMenuItem>
              ))}
              {canCreateWorkspace && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="gap-2 p-2"
                    onSelect={() => setCreateOpen(true)}
                  >
                    <div className="bg-background flex size-6 items-center justify-center rounded-md border">
                      <Plus className="size-4" />
                    </div>
                    <div className="font-medium">{t('newWorkspace')}</div>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      {canCreateWorkspace && (
        <CreateWorkspaceDialog open={createOpen} onOpenChange={setCreateOpen} />
      )}
    </>
  );
}
