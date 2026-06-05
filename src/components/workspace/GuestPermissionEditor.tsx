import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { useMemberPermissions, type MemberPermission } from '@/hooks/useMemberPermissions';
import type { PermissionResource } from '@/lib/permissions';

const RESOURCE_KEYS: PermissionResource[] = [
  'transactions',
  'installments',
  'recurring',
  'categories',
  'settings',
  'members',
];

const ACTIONS = ['can_read', 'can_create', 'can_update', 'can_delete'] as const;

interface GuestPermissionEditorProps {
  workspaceId: string;
  userId: string;
  currentUserId: string;
}

export function GuestPermissionEditor({ workspaceId, userId, currentUserId }: GuestPermissionEditorProps) {
  const { t } = useTranslation(['permissions', 'common']);
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
      toast.error(t('guestEditor.toast.updateError'));
    }
  };

  const handleReset = async () => {
    try {
      await resetAll.mutateAsync();
      toast.success(t('guestEditor.toast.reset'));
    } catch {
      toast.error(t('guestEditor.toast.resetError'));
    }
  };

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  const hasOverrides = overrides.length > 0;

  return (
    <div className="space-y-3">
      <p className="text-muted-foreground text-xs">{t('guestEditor.hint')}</p>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-40">{t('guestEditor.colScreen')}</TableHead>
              {ACTIONS.map((action) => (
                <TableHead key={action} className="text-center w-20">
                  {t(`actionsLong.${action}`, { defaultValue: action })}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {RESOURCE_KEYS.map((resource) => {
              const override = overrideMap.get(resource);
              return (
                <TableRow key={resource}>
                  <TableCell className="font-medium">
                    {t(`resources.${resource}`, { defaultValue: resource })}
                    {!override && (
                      <span className="text-muted-foreground ml-1 text-xs">
                        {t('guestEditor.fromRole')}
                      </span>
                    )}
                  </TableCell>
                  {ACTIONS.map((action) => (
                    <TableCell key={action} className="text-center">
                      <Checkbox
                        checked={override?.[action] ?? false}
                        disabled={upsert.isPending}
                        onCheckedChange={(value) =>
                          handleToggle(resource, action, value === true)
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
            {t('guestEditor.resetToRole')}
          </Button>
        </div>
      )}
    </div>
  );
}
