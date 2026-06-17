import { useMemo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
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
import { getInstallmentColumns } from './installment-columns';
import { useInstallments, type Installment } from '@/hooks/useInstallments';
import { useWorkspace } from '@/context/WorkspaceContext';
import { usePermissions } from '@/hooks/usePermissions';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface InstallmentTableProps {
  highlightId?: string;
}

export function InstallmentTable({ highlightId }: InstallmentTableProps) {
  const { t } = useTranslation(['installments', 'common']);
  const { activeWorkspaceId } = useWorkspace();
  const { can } = usePermissions();
  const { data: items = [], isLoading, update, earlyPayoff, remove } = useInstallments(activeWorkspaceId);
  const [editTarget, setEditTarget] = useState<Installment | null>(null);

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
        canAct: can('installments', 'update') || can('installments', 'delete'),
        onEdit: setEditTarget,
        onPayoff: handlePayoff,
        onDelete: handleDelete,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t],
  );

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-muted-foreground py-12 text-center">
        <CreditCard className="mx-auto mb-3 h-10 w-10 opacity-30" />
        <p className="font-medium">{t('empty')}</p>
        <p className="text-sm">{t('emptyHint')}</p>
      </div>
    );
  }

  return (
    <>
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
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
                row.original.id === highlightId && 'ring-2 ring-primary ring-offset-2',
              )}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>

      {editTarget && (
        <InstallmentForm
          open={!!editTarget}
          onOpenChange={(open) => !open && setEditTarget(null)}
          mode="edit"
          installment={editTarget}
          onSubmit={(input) => update.mutateAsync({ id: editTarget.id, ...input })}
        />
      )}
    </>
  );
}
