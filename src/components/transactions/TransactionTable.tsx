import { useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TransactionTableSkeleton } from './TransactionTableSkeleton';
import { TransactionForm } from './TransactionForm';
import { getTransactionColumns } from './transaction-columns';
import { useTransactions, type Transaction, type TransactionStatus } from '@/hooks/useTransactions';
import { useWorkspace } from '@/context/WorkspaceContext';
import { toast } from 'sonner';

interface TransactionTableProps {
  month: number;
  year: number;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
}

const columns = getTransactionColumns();

export function TransactionTable({
  month,
  year,
  categoryFilter,
  onCategoryFilterChange,
}: TransactionTableProps) {
  const { activeWorkspaceId } = useWorkspace();
  const { data: transactions = [], isLoading, update, remove } = useTransactions(
    activeWorkspaceId,
    month,
    year,
  );
  const [editTarget, setEditTarget] = useState<Transaction | null>(null);

  const categories = Array.from(
    new Map(
      transactions
        .filter((t) => t.categories)
        .map((t) => [t.categories!.id, t.categories!]),
    ).values(),
  );

  const filtered =
    categoryFilter === 'all'
      ? transactions
      : transactions.filter((t) => t.category_id === categoryFilter);

  const handleToggleStatus = async (id: string, status: TransactionStatus) => {
    try {
      await update.mutateAsync({ id, status });
      toast.success(status === 'pago' ? 'Marcado como pago' : 'Marcado como pendente');
    } catch {
      toast.error('Erro ao atualizar status');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove.mutateAsync(id);
      toast.success('Transação excluída.');
    } catch {
      toast.error('Erro ao excluir transação.');
    }
  };

  const table = useReactTable({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      onEdit: setEditTarget,
      onDelete: handleDelete,
      onToggleStatus: handleToggleStatus,
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <TransactionTableSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {categories.length > 0 && (
        <div className="flex items-center gap-2">
          <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-muted-foreground py-12 text-center">
          <p className="text-lg font-medium">Nenhuma transação encontrada</p>
          <p className="text-sm">Clique em "Nova Transação" para começar.</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={
                        header.id === 'type' || header.id === 'actions'
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
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={
                        cell.column.id === 'type' || cell.column.id === 'actions'
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
      )}

      {editTarget && (
        <TransactionForm
          open={!!editTarget}
          onOpenChange={(open) => !open && setEditTarget(null)}
          transaction={editTarget}
          onSubmit={(input) =>
            update.mutateAsync({ id: editTarget.id, ...input })
          }
          mode="edit"
        />
      )}
    </div>
  );
}
