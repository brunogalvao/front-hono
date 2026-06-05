import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { useRolePermissions, type RolePermission } from '@/hooks/useRolePermissions';
import type { PermissionResource } from '@/lib/permissions';

const ROLE_KEYS: Array<RolePermission['role']> = [
  'administrador',
  'operador',
  'visualizador',
];

const RESOURCE_KEYS: PermissionResource[] = [
  'transactions',
  'installments',
  'recurring',
  'categories',
  'settings',
  'members',
  'permissions',
];

const ACTIONS = ['can_read', 'can_create', 'can_update', 'can_delete'] as const;

interface PermissionMatrixProps {
  workspaceId: string;
  currentUserId: string;
}

export function PermissionMatrix({ workspaceId, currentUserId }: PermissionMatrixProps) {
  const { t } = useTranslation(['permissions', 'common']);
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
      toast.error(t('matrix.updateError'));
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
            <TableHead className="w-40">{t('matrix.colScreen')}</TableHead>
            {ROLE_KEYS.map((role) => (
              <TableHead key={role} colSpan={4} className="text-center border-l">
                {t(`roles.${role}`, { defaultValue: role })}
              </TableHead>
            ))}
          </TableRow>
          <TableRow>
            <TableHead />
            {ROLE_KEYS.map((role) =>
              ACTIONS.map((action) => (
                <TableHead
                  key={`${role}-${action}`}
                  className="text-center text-xs font-mono w-10 border-l first:border-l-0"
                >
                  {t(`actionsShort.${action}`, { defaultValue: action })}
                </TableHead>
              )),
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {RESOURCE_KEYS.map((resource) => (
            <TableRow key={resource}>
              <TableCell className="font-medium">
                {t(`resources.${resource}`, { defaultValue: resource })}
              </TableCell>
              {ROLE_KEYS.map((role) =>
                ACTIONS.map((action) => {
                  const perm = matrix.get(`${role}__${resource}`);
                  const checked = perm?.[action] ?? false;
                  // Lock permissions resource for non-superuser editing
                  const locked = resource === 'permissions';
                  return (
                    <TableCell
                      key={`${role}-${resource}-${action}`}
                      className="text-center border-l first:border-l-0"
                    >
                      <Checkbox
                        checked={checked}
                        disabled={locked || upsert.isPending}
                        onCheckedChange={(value) =>
                          handleToggle(role, resource, action, value === true)
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
