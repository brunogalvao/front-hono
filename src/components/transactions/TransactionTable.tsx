import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
import { TrendingUp, CircleCheck, Clock } from 'lucide-react';
import { useTransactions, type Transaction, type TransactionStatus } from '@/hooks/useTransactions';
import { useWorkspace } from '@/context/WorkspaceContext';
import { formatToBRL } from '@/utils/format';
import { toast } from 'sonner';

interface TransactionTableProps {
  month: number;
  year: number;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
}

export function TransactionTable({
  month,
  year,
  categoryFilter,
  onCategoryFilterChange,
}: TransactionTableProps) {
  const { t } = useTranslation('transactions');
  const { activeWorkspaceId } = useWorkspace();
  const { data: transactions = [], isLoading, update, remove } = useTransactions(
    activeWorkspaceId,
    month,
    year,
  );
  const [editTarget, setEditTarget] = useState<Transaction | null>(null);

  const columns = useMemo(() => getTransactionColumns(t), [t]);

  const totals = useMemo(() => ({
    pago: transactions.filter((tx) => tx.status === 'pago').reduce((s, tx) => s + tx.amount, 0),
    pendente: transactions.filter((tx) => tx.status === 'pendente').reduce((s, tx) => s + tx.amount, 0),
    recebido: transactions.filter((tx) => tx.status === 'recebido').reduce((s, tx) => s + tx.amount, 0),
  }), [transactions]);

  const categories = useMemo(() => Array.from(
    new Map(
      transactions
        .filter((tx) => tx.categories)
        .map((tx) => [tx.categories!.id, tx.categories!]),
    ).values(),
  ), [transactions]);

  const filtered = useMemo(() =>
    categoryFilter === 'all'
      ? transactions
      : transactions.filter((tx) => tx.category_id === categoryFilter),
    [transactions, categoryFilter],
  );

  const handleToggleStatus = async (id: string, status: TransactionStatus) => {
    try {
      await update.mutateAsync({ id, status });
      toast.success(status === 'pago' ? t('toast.markedPaid') : t('toast.markedPending'));
    } catch {
      toast.error(t('toast.statusError'));
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
      <div className="flex items-center justify-between gap-4">

        {/* Esquerda: filtro | recebido */}
        <div className="flex items-center gap-3">
          {categories.length > 0 && (
            <>
              <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={t('table.filterByCategory')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('table.allCategories')}</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="h-5 w-px bg-border shrink-0" />
            </>
          )}
          <div className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium bg-green-500/15 text-green-600 dark:text-green-400">
            <TrendingUp className="h-4 w-4 shrink-0" />
            <span>{t('status.recebido')}</span>
            <span className="tabular-nums font-semibold">{formatToBRL(totals.recebido)}</span>
          </div>
        </div>

        {/* Direita: pago + pendente empilhados */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium bg-green-500/15 text-green-600 dark:text-green-400">
            <CircleCheck className="h-4 w-4 shrink-0" />
            <span>{t('status.pago')}</span>
            <span className="tabular-nums font-semibold">{formatToBRL(totals.pago)}</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <Clock className="h-4 w-4 shrink-0" />
            <span>{t('status.pendente')}</span>
            <span className="tabular-nums font-semibold">{formatToBRL(totals.pendente)}</span>
          </div>
        </div>

      </div>

      {filtered.length === 0 ? (
        <div className="text-muted-foreground py-12 text-center">
          <p className="text-lg font-medium">{t('table.empty')}</p>
          <p className="text-sm">{t('table.emptyHint')}</p>
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
