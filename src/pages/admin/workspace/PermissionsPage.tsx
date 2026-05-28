import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { AllUsersTable } from '@/components/workspace/AllUsersTable';
import { InviteForm } from '@/components/workspace/InviteForm';
import { useSuperAdminGuard } from '@/hooks/useSuperAdminGuard';
import { useAllAppUsers } from '@/hooks/useAllAppUsers';
import { useWorkspaceMembers } from '@/hooks/useWorkspaceMembers';
import { useWorkspace } from '@/context/WorkspaceContext';
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

export default function PermissionsPage() {
  const { isAllowed, isLoading: isGuardLoading } = useSuperAdminGuard();
  const { activeWorkspace } = useWorkspace();
  const { data: currentUserId } = useCurrentUserId();
  const { data: users, isLoading: isUsersLoading } = useAllAppUsers(activeWorkspace?.id ?? null);
  const { inviteMember } = useWorkspaceMembers(activeWorkspace?.id ?? null);

  if (isGuardLoading) {
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

  if (!isAllowed || !activeWorkspace) return null;

  const handleInvite = (
    email: string,
    role: Parameters<typeof inviteMember.mutateAsync>[0]['role'],
  ) => inviteMember.mutateAsync({ email, role });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Gerenciamento de Permissões</h1>
        <p className="text-muted-foreground text-sm">
          Gerencie o acesso e os papéis dos usuários no workspace
        </p>
      </div>

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
