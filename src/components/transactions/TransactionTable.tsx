import { useState, useMemo, Fragment } from 'react';
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
import { TrendingUp, TrendingDown, CircleCheck, Clock } from 'lucide-react';
import { useTransactions, type Transaction, type TransactionStatus } from '@/hooks/useTransactions';
import { useWorkspace } from '@/context/WorkspaceContext';
import { formatToBRL } from '@/utils/format';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const STATUS_ORDER: Record<string, number> = { pendente: 0, pago: 1, recebido: 2 };

const GROUP_CONFIG = {
  pendente: { Icon: Clock, colorClass: 'text-amber-600 dark:text-amber-400', bgClass: 'bg-amber-500/10' },
  pago: { Icon: CircleCheck, colorClass: 'text-green-600 dark:text-green-400', bgClass: 'bg-green-500/10' },
  recebido: { Icon: TrendingUp, colorClass: 'text-green-600 dark:text-green-400', bgClass: 'bg-green-500/10' },
} as const;

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

  const totals = useMemo(() => {
    const pago = transactions.filter((tx) => tx.status === 'pago').reduce((s, tx) => s + tx.amount, 0);
    const pendente = transactions.filter((tx) => tx.status === 'pendente').reduce((s, tx) => s + tx.amount, 0);
    const recebido = transactions.filter((tx) => tx.status === 'recebido').reduce((s, tx) => s + tx.amount, 0);
    return { pago, pendente, recebido, saldo: recebido - pago };
  }, [transactions]);

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

  const groupTotals = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const tx of filtered) {
      acc[tx.status] = (acc[tx.status] ?? 0) + tx.amount;
    }
    return acc;
  }, [filtered]);

  const sortedFiltered = useMemo(
    () => [...filtered].sort((a, b) => (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99)),
    [filtered],
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
    data: sortedFiltered,
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
          <div className={cn(
            'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium',
            totals.saldo >= 0
              ? 'bg-green-500/15 text-green-600 dark:text-green-400'
              : 'bg-red-500/15 text-red-600 dark:text-red-400',
          )}>
            {totals.saldo >= 0
              ? <TrendingUp className="h-4 w-4 shrink-0" />
              : <TrendingDown className="h-4 w-4 shrink-0" />}
            <span>{t('status.saldo')}</span>
            <span className="tabular-nums font-semibold">{formatToBRL(totals.saldo)}</span>
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
              {table.getRowModel().rows.map((row, index, rows) => {
                const isNewGroup = index === 0 || rows[index - 1].original.status !== row.original.status;
                const config = GROUP_CONFIG[row.original.status as keyof typeof GROUP_CONFIG];
                return (
                  <Fragment key={row.id}>
                    {isNewGroup && config && (
                      <TableRow className={cn('hover:bg-transparent', config.bgClass)}>
                        <TableCell colSpan={columns.length} className="py-2 px-4">
                          <div className={cn('flex items-center gap-2 text-sm font-semibold', config.colorClass)}>
                            <config.Icon className="h-4 w-4" />
                            <span>{t(`status.${row.original.status}` as `status.${typeof row.original.status}`)}</span>
                            <span className="ml-auto tabular-nums font-medium">
                              {formatToBRL(groupTotals[row.original.status] ?? 0)}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow>
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
                  </Fragment>
                );
              })}
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
