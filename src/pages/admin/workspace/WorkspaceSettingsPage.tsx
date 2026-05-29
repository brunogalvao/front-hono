import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CategoryManager } from '@/components/workspace/CategoryManager';
import { useWorkspace } from '@/context/WorkspaceContext';
import { canManageMembers } from '@/lib/permissions';

export default function WorkspaceSettingsPage() {
  const { activeWorkspace, activeRole } = useWorkspace();

  if (!activeWorkspace) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground text-sm">
          Configurações do workspace
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{activeWorkspace.name}</CardTitle>
          <CardDescription>Workspace ativo</CardDescription>
        </CardHeader>
      </Card>

      {canManageMembers(activeRole) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Categorias</CardTitle>
            <CardDescription>
              Gerencie categorias personalizadas do workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryManager />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
