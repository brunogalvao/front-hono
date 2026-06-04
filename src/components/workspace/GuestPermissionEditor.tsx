import { useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { useMemberPermissions, type MemberPermission } from '@/hooks/useMemberPermissions';
import type { PermissionResource } from '@/lib/permissions';

const RESOURCES: Array<{ key: PermissionResource; label: string }> = [
  { key: 'transactions', label: 'Transações' },
  { key: 'installments', label: 'Parcelamentos' },
  { key: 'recurring', label: 'Recorrências' },
  { key: 'categories', label: 'Categorias' },
  { key: 'settings', label: 'Configurações' },
  { key: 'members', label: 'Membros' },
];

const ACTIONS = ['can_read', 'can_create', 'can_update', 'can_delete'] as const;
const ACTION_LABELS = { can_read: 'Ler', can_create: 'Criar', can_update: 'Editar', can_delete: 'Excluir' };

interface GuestPermissionEditorProps {
  workspaceId: string;
  userId: string;
  currentUserId: string;
}

export function GuestPermissionEditor({ workspaceId, userId, currentUserId }: GuestPermissionEditorProps) {
  const { data: overrides = [], isLoading, upsert, resetAll } = useMemberPermissions(workspaceId, userId);

  const overrideMap = useMemo(() => {
    const map = new Map<PermissionResource, MemberPermission>();
    for (const p of overrides) map.set(p.resource, p);
    return map;
  }, [overrides]);

  const handleToggle = async (
    resource: PermissionResource,
    action: typeof ACTIONS[number],
    nextValue: boolean,
  ) => {
    const existing = overrideMap.get(resource);
    const base = existing ?? {
      workspace_id: workspaceId,
      user_id: userId,
      resource,
      can_read: false,
      can_create: false,
      can_update: false,
      can_delete: false,
    };

    try {
      await upsert.mutateAsync({
        ...base,
        [action]: nextValue,
        updated_by: currentUserId,
      });
    } catch {
      toast.error('Erro ao atualizar permissão individual');
    }
  };

  const handleReset = async () => {
    try {
      await resetAll.mutateAsync();
      toast.success('Permissões resetadas para o padrão do papel');
    } catch {
      toast.error('Erro ao resetar permissões');
    }
  };

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  const hasOverrides = overrides.length > 0;

  return (
    <div className="space-y-3">
      <p className="text-muted-foreground text-xs">
        Permissões individuais sobrepõem as do papel padrão. Telas sem override usam as permissões do papel atribuído.
      </p>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-40">Tela</TableHead>
              {ACTIONS.map((action) => (
                <TableHead key={action} className="text-center w-20">
                  {ACTION_LABELS[action]}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {RESOURCES.map((resource) => {
              const override = overrideMap.get(resource.key);
              return (
                <TableRow key={resource.key}>
                  <TableCell className="font-medium">
                    {resource.label}
                    {!override && (
                      <span className="text-muted-foreground ml-1 text-xs">(papel)</span>
                    )}
                  </TableCell>
                  {ACTIONS.map((action) => (
                    <TableCell key={action} className="text-center">
                      <Checkbox
                        checked={override?.[action] ?? false}
                        disabled={upsert.isPending}
                        onCheckedChange={(value) =>
                          handleToggle(resource.key, action, value === true)
                        }
                      />
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {hasOverrides && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={resetAll.isPending}
          >
            Resetar para padrão do papel
          </Button>
        </div>
      )}
    </div>
  );
}
