import { useQuery } from '@tanstack/react-query';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MemberList } from '@/components/workspace/MemberList';
import { InviteForm } from '@/components/workspace/InviteForm';
import { CategoryManager } from '@/components/workspace/CategoryManager';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useWorkspaceMembers } from '@/hooks/useWorkspaceMembers';
import { canManageMembers } from '@/lib/permissions';
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

export default function WorkspaceSettingsPage() {
  const { activeWorkspace, activeRole } = useWorkspace();
  const { data: currentUserId } = useCurrentUserId();
  const { inviteMember } = useWorkspaceMembers(activeWorkspace?.id ?? null);

  if (!activeWorkspace) return null;

  const handleInvite = (email: string, role: Parameters<typeof inviteMember.mutateAsync>[0]['role']) =>
    inviteMember.mutateAsync({ email, role });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground text-sm">Gerenciar membros e configurações do workspace</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{activeWorkspace.name}</CardTitle>
          <CardDescription>Workspace ativo</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Membros</CardTitle>
          <CardDescription>Usuários com acesso a este workspace</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <MemberList
            currentUserId={currentUserId ?? ''}
            superuserId={activeWorkspace.superuser_id}
          />

          {canManageMembers(activeRole) && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-3">Convidar novo membro</p>
                <InviteForm onInvite={handleInvite} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {canManageMembers(activeRole) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Categorias</CardTitle>
            <CardDescription>Gerencie categorias personalizadas do workspace</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryManager />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
