import { useMemo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { CreditCard } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { InstallmentForm } from './InstallmentForm';
import {
  getInstallmentColumns,
  InstallmentActionsCell,
} from './installment-columns';
import { useInstallments, type Installment } from '@/hooks/useInstallments';
import { useWorkspace } from '@/context/WorkspaceContext';
import { usePermissions } from '@/hooks/usePermissions';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  MobileRecordList,
  MobileRecordListItem,
} from '@/components/ui/mobile-record-list';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatToBRL } from '@/utils/format';

interface InstallmentTableProps {
  highlightId?: string;
}

export function InstallmentTable({ highlightId }: InstallmentTableProps) {
  const { t } = useTranslation(['installments', 'common']);
  const { activeWorkspaceId } = useWorkspace();
  const { can } = usePermissions();
  const isMobile = useIsMobile();
  const {
    data: items = [],
    isLoading,
    update,
    earlyPayoff,
    remove,
  } = useInstallments(activeWorkspaceId);
  const [editTarget, setEditTarget] = useState<Installment | null>(null);
  const canAct = can('installments', 'update') || can('installments', 'delete');

  useEffect(() => {
    if (highlightId) {
      const el = document.getElementById(`installment-row-${highlightId}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightId, items]);

  const handlePayoff = async (item: Installment) => {
    try {
      await earlyPayoff.mutateAsync(item.id);
      toast.success(t('toast.paidOff'));
    } catch {
      toast.error(t('toast.payoffError'));
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
      getInstallmentColumns(t, {
        canAct,
        onEdit: setEditTarget,
        onPayoff: handlePayoff,
        onDelete: handleDelete,
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
        <CreditCard className="mx-auto mb-3 h-10 w-10 opacity-30" />
        <p className="font-medium">{t('empty')}</p>
        <p className="text-sm">{t('emptyHint')}</p>
      </div>
    );
  }

  return (
    <>
      {isMobile ? (
        <MobileRecordList aria-label={t('title')}>
          {items.map((item) => {
            const remaining = item.total_installments - item.paid_installments;
            const progress =
              (item.paid_installments / item.total_installments) * 100;
            return (
              <MobileRecordListItem
                key={item.id}
                id={`installment-row-${item.id}`}
                className={cn(
                  'space-y-3',
                  item.status !== 'active' && 'opacity-70',
                  item.id === highlightId && 'ring-primary ring-2 ring-offset-2'
                )}
              >
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{item.description}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <Badge variant="outline">
                        {t(`status.${item.status}`)}
                      </Badge>
                      {item.categories && (
                        <Badge variant="secondary">
                          {item.categories.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-semibold text-red-500 tabular-nums">
                      {formatToBRL(item.installment_amount)}
                      {t('perMonth')}
                    </p>
                    <p className="text-muted-foreground text-xs tabular-nums">
                      {formatToBRL(item.total_amount)} {t('totalSuffix')}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground flex justify-between gap-2 text-xs">
                    <span>
                      {t('progress', {
                        paid: item.paid_installments,
                        total: item.total_installments,
                      })}
                    </span>
                    <span>
                      {remaining > 0
                        ? t('remaining', { count: remaining })
                        : t('done')}
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
                {canAct && item.status === 'active' && (
                  <InstallmentActionsCell
                    item={item}
                    onEdit={setEditTarget}
                    onPayoff={handlePayoff}
                    onDelete={handleDelete}
                  />
                )}
              </MobileRecordListItem>
            );
          })}
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
                    <TableHead key={header.id}>
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
                  id={`installment-row-${row.original.id}`}
                  className={cn(
                    row.original.status !== 'active' && 'opacity-70',
                    row.original.id === highlightId &&
                      'ring-primary ring-2 ring-offset-2'
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
        <InstallmentForm
          open={!!editTarget}
          onOpenChange={(open) => !open && setEditTarget(null)}
          mode="edit"
          installment={editTarget}
          onSubmit={(input) =>
            update.mutateAsync({ id: editTarget.id, ...input })
          }
        />
      )}
    </>
  );
}
