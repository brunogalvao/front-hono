import { useMemo, useState } from 'react';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Power } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { RecurringForm } from './RecurringForm';
import { getRecurringColumns } from './recurring-columns';
import { useRecurring, type RecurringExpense } from '@/hooks/useRecurring';
import { useWorkspace } from '@/context/WorkspaceContext';
import { usePermissions } from '@/hooks/usePermissions';
import { toast } from 'sonner';

export function RecurringTable() {
  const { activeWorkspaceId } = useWorkspace();
  const { can } = usePermissions();
  const { data: items = [], isLoading, update, toggleActive, remove } = useRecurring(activeWorkspaceId);
  const [editTarget, setEditTarget] = useState<RecurringExpense | null>(null);

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await toggleActive.mutateAsync({ id, is_active: !current });
      toast.success(current ? 'Recorrência desativada.' : 'Recorrência ativada.');
    } catch {
      toast.error('Erro ao alterar status.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove.mutateAsync(id);
      toast.success('Recorrência excluída.');
    } catch {
      toast.error('Erro ao excluir.');
    }
  };

  const columns = useMemo(
    () =>
      getRecurringColumns({
        canAct: can('recurring', 'update') || can('recurring', 'delete'),
        onEdit: setEditTarget,
        onDelete: handleDelete,
        onToggle: handleToggle,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
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
        <Power className="mx-auto mb-3 h-10 w-10 opacity-30" />
        <p className="font-medium">Nenhuma despesa recorrente</p>
        <p className="text-sm">Adicione uma recorrência para começar.</p>
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
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className={!row.original.is_active ? 'opacity-60' : ''}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={
                      cell.column.id === 'frequency' || cell.column.id === 'status'
                        ? 'hidden sm:table-cell'
                        : undefined
                    }
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editTarget && (
        <RecurringForm
          open={!!editTarget}
          onOpenChange={(open) => !open && setEditTarget(null)}
          recurring={editTarget}
          onSubmit={(input) => update.mutateAsync({ id: editTarget.id, ...input })}
          mode="edit"
        />
      )}
    </>
  );
}
