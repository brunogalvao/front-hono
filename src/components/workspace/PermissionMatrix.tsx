import { useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { useRolePermissions, type RolePermission } from '@/hooks/useRolePermissions';
import type { PermissionResource } from '@/lib/permissions';

const ROLES: Array<{ key: RolePermission['role']; label: string }> = [
  { key: 'administrador', label: 'Administrador' },
  { key: 'operador', label: 'Operador' },
  { key: 'visualizador', label: 'Visualizador' },
];

const RESOURCES: Array<{ key: PermissionResource; label: string }> = [
  { key: 'transactions', label: 'Transações' },
  { key: 'installments', label: 'Parcelamentos' },
  { key: 'recurring', label: 'Recorrências' },
  { key: 'categories', label: 'Categorias' },
  { key: 'settings', label: 'Configurações' },
  { key: 'members', label: 'Membros' },
  { key: 'permissions', label: 'Permissões' },
];

const ACTIONS = ['can_read', 'can_create', 'can_update', 'can_delete'] as const;
const ACTION_LABELS = { can_read: 'R', can_create: 'C', can_update: 'U', can_delete: 'D' };

interface PermissionMatrixProps {
  workspaceId: string;
  currentUserId: string;
}

export function PermissionMatrix({ workspaceId, currentUserId }: PermissionMatrixProps) {
  const { data: permissions = [], isLoading, upsert } = useRolePermissions(workspaceId);

  // Index by `${role}__${resource}` for O(1) lookup
  const matrix = useMemo(() => {
    const map = new Map<string, RolePermission>();
    for (const p of permissions) map.set(`${p.role}__${p.resource}`, p);
    return map;
  }, [permissions]);

  const handleToggle = async (
    role: RolePermission['role'],
    resource: PermissionResource,
    action: typeof ACTIONS[number],
    nextValue: boolean,
  ) => {
    const existing = matrix.get(`${role}__${resource}`);
    const base = existing ?? {
      workspace_id: workspaceId,
      role,
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
      toast.error('Erro ao atualizar permissão');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-40">Tela</TableHead>
            {ROLES.map((role) => (
              <TableHead key={role.key} colSpan={4} className="text-center border-l">
                {role.label}
              </TableHead>
            ))}
          </TableRow>
          <TableRow>
            <TableHead />
            {ROLES.map((role) =>
              ACTIONS.map((action) => (
                <TableHead
                  key={`${role.key}-${action}`}
                  className="text-center text-xs font-mono w-10 border-l first:border-l-0"
                >
                  {ACTION_LABELS[action]}
                </TableHead>
              )),
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {RESOURCES.map((resource) => (
            <TableRow key={resource.key}>
              <TableCell className="font-medium">{resource.label}</TableCell>
              {ROLES.map((role) =>
                ACTIONS.map((action) => {
                  const perm = matrix.get(`${role.key}__${resource.key}`);
                  const checked = perm?.[action] ?? false;
                  // Lock permissions resource for non-superuser editing
                  const locked = resource.key === 'permissions';
                  return (
                    <TableCell
                      key={`${role.key}-${resource.key}-${action}`}
                      className="text-center border-l first:border-l-0"
                    >
                      <Checkbox
                        checked={checked}
                        disabled={locked || upsert.isPending}
                        onCheckedChange={(value) =>
                          handleToggle(role.key, resource.key, action, value === true)
                        }
                      />
                    </TableCell>
                  );
                }),
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
