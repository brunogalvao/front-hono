import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { AllUsersTable } from '@/components/workspace/AllUsersTable';
import { InviteForm } from '@/components/workspace/InviteForm';
import { PermissionMatrix } from '@/components/workspace/PermissionMatrix';
import { usePermissions } from '@/hooks/usePermissions';
import { useAllAppUsers } from '@/hooks/useAllAppUsers';
import { useWorkspaceMembers } from '@/hooks/useWorkspaceMembers';
import { useWorkspace } from '@/context/WorkspaceContext';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';

function useCurrentUserId() {
  return useQuery({
    queryKey: queryKeys.auth.session,
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user?.id ?? null;
    },
  });
}

export default function PermissionsPage() {
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspace();
  const { can, isSuperAdmin, isLoading: isPermLoading } = usePermissions();
  const { data: currentUserId } = useCurrentUserId();
  const { data: users, isLoading: isUsersLoading } = useAllAppUsers(activeWorkspace?.id ?? null);
  const { inviteMember } = useWorkspaceMembers(activeWorkspace?.id ?? null);

  const canManageMembers = can('members', 'read');

  useEffect(() => {
    if (isPermLoading || !activeWorkspace) return;
    if (!canManageMembers) {
      toast.error('Acesso restrito');
      navigate({ to: '/admin/dashboard' });
    }
  }, [isPermLoading, canManageMembers, activeWorkspace, navigate]);

  if (isPermLoading || !activeWorkspace) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!canManageMembers) return null;

  const handleInvite = (
    email: string,
    role: Parameters<typeof inviteMember.mutateAsync>[0]['role'],
  ) => inviteMember.mutateAsync({ email, role });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {isSuperAdmin ? 'Gerenciamento de Permissões' : 'Gerenciamento de Membros'}
        </h1>
        <p className="text-muted-foreground text-sm">
          {isSuperAdmin
            ? 'Gerencie o acesso e os papéis dos usuários no workspace'
            : 'Convide e remova membros do workspace'}
        </p>
      </div>

      {isSuperAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Matriz de permissões por papel</CardTitle>
            <CardDescription>
              Configure quais operações (Ler, Criar, Atualizar, Excluir) cada papel pode executar em cada tela.
              Mudanças são aplicadas imediatamente para todos os membros.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PermissionMatrix workspaceId={activeWorkspace.id} currentUserId={currentUserId ?? ''} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Usuários da aplicação</CardTitle>
          <CardDescription>
            Todos os usuários cadastrados — membros do workspace e usuários sem acesso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AllUsersTable
            users={users}
            isLoading={isUsersLoading}
            currentUserId={currentUserId ?? ''}
            workspaceId={activeWorkspace.id}
            isSuperAdmin={isSuperAdmin}
          />

          <Separator />

          <div>
            <p className="text-sm font-medium mb-3">Convidar por e-mail</p>
            <InviteForm onInvite={handleInvite} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
