import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Power } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RecurringForm } from './RecurringForm';
import { getRecurringColumns, RecurringActionsCell } from './recurring-columns';
import { useRecurring, type RecurringExpense } from '@/hooks/useRecurring';
import { useWorkspace } from '@/context/WorkspaceContext';
import { usePermissions } from '@/hooks/usePermissions';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  MobileRecordList,
  MobileRecordListItem,
} from '@/components/ui/mobile-record-list';
import { Badge } from '@/components/ui/badge';
import { CategoryIcon } from '@/lib/category-icons';
import { formatToBRL } from '@/utils/format';
import { cn } from '@/lib/utils';

export function RecurringTable() {
  const { t } = useTranslation('recurring');
  const { activeWorkspaceId } = useWorkspace();
  const { can } = usePermissions();
  const isMobile = useIsMobile();
  const {
    data: items = [],
    isLoading,
    update,
    toggleActive,
    remove,
  } = useRecurring(activeWorkspaceId);
  const [editTarget, setEditTarget] = useState<RecurringExpense | null>(null);
  const canAct = can('recurring', 'update') || can('recurring', 'delete');

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await toggleActive.mutateAsync({ id, is_active: !current });
      toast.success(current ? t('toast.deactivated') : t('toast.activated'));
    } catch {
      toast.error(t('toast.toggleError'));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove.mutateAsync(id);
      toast.success(t('toast.deleted'));
    } catch {
      toast.error(t('toast.deleteError'));
    }
  };

  const columns = useMemo(
    () =>
      getRecurringColumns(t, {
        canAct,
        onEdit: setEditTarget,
        onDelete: handleDelete,
        onToggle: handleToggle,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t]
  );

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div data-slot="collection-loading" className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div
        data-slot="collection-empty-state"
        className="text-muted-foreground py-12 text-center"
      >
        <Power className="mx-auto mb-3 h-10 w-10 opacity-30" />
        <p className="font-medium">{t('table.empty')}</p>
        <p className="text-sm">{t('table.emptyHint')}</p>
      </div>
    );
  }

  return (
    <>
      {isMobile ? (
        <MobileRecordList aria-label={t('title')}>
          {items.map((item) => (
            <MobileRecordListItem
              key={item.id}
              className={cn('space-y-3', !item.is_active && 'opacity-60')}
            >
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <p
                    className={cn(
                      'truncate font-medium',
                      !item.is_active && 'line-through'
                    )}
                  >
                    {item.description}
                  </p>
                  {item.categories && (
                    <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                      <CategoryIcon
                        name={item.categories.icon}
                        className="size-3 shrink-0"
                      />
                      <span className="truncate">{item.categories.name}</span>
                    </p>
                  )}
                </div>
                <span className="shrink-0 font-semibold text-red-500 tabular-nums">
                  - {formatToBRL(item.amount)}
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    {t(`frequency.${item.frequency}`)}
                  </Badge>
                  <Badge variant={item.is_active ? 'default' : 'secondary'}>
                    {item.is_active ? t('status.active') : t('status.inactive')}
                  </Badge>
                </div>
                {canAct && (
                  <RecurringActionsCell
                    item={item}
                    onEdit={setEditTarget}
                    onDelete={handleDelete}
                    onToggle={handleToggle}
                  />
                )}
              </div>
            </MobileRecordListItem>
          ))}
        </MobileRecordList>
      ) : (
        <div
          data-slot="desktop-table"
          className="hidden rounded-md border md:block"
        >
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={
                        header.id === 'frequency' || header.id === 'status'
                          ? 'hidden sm:table-cell'
                          : undefined
                      }
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={!row.original.is_active ? 'opacity-60' : ''}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={
                        cell.column.id === 'frequency' ||
                        cell.column.id === 'status'
                          ? 'hidden sm:table-cell'
                          : undefined
                      }
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {editTarget && (
        <RecurringForm
          open={!!editTarget}
          onOpenChange={(open) => !open && setEditTarget(null)}
          recurring={editTarget}
          onSubmit={(input) =>
            update.mutateAsync({ id: editTarget.id, ...input })
          }
          mode="edit"
        />
      )}
    </>
  );
}
