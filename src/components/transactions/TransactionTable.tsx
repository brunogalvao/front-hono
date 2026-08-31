import { useEffect, useState, useMemo, Fragment } from 'react';
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
import {
  useTransactions,
  type Transaction,
  type TransactionStatus,
} from '@/hooks/useTransactions';
import { useWorkspace } from '@/context/WorkspaceContext';
import { formatToBRL } from '@/utils/format';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Link } from '@tanstack/react-router';
import { ExternalLink } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePermissions } from '@/hooks/usePermissions';
import {
  MobileRecordList,
  MobileRecordListItem,
} from '@/components/ui/mobile-record-list';
import { CategoryIcon } from '@/lib/category-icons';
import { TransactionActionsCell } from './TransactionActionsCell';

const STATUS_ORDER: Record<string, number> = {
  pendente: 0,
  pago: 1,
  recebido: 2,
};

const GROUP_CONFIG = {
  pendente: {
    Icon: Clock,
    colorClass: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-amber-500/10',
  },
  pago: {
    Icon: CircleCheck,
    colorClass: 'text-green-600 dark:text-green-400',
    bgClass: 'bg-green-500/10',
  },
  recebido: {
    Icon: TrendingUp,
    colorClass: 'text-green-600 dark:text-green-400',
    bgClass: 'bg-green-500/10',
  },
} as const;

interface TransactionTableProps {
  month: number;
  year: number;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  statusFilter: TransactionStatus | 'all';
  onStatusFilterChange: (value: TransactionStatus | 'all') => void;
  highlightId?: string;
}

export function TransactionTable({
  month,
  year,
  categoryFilter,
  onCategoryFilterChange,
  statusFilter,
  onStatusFilterChange,
  highlightId,
}: TransactionTableProps) {
  const { t } = useTranslation('transactions');
  const { activeWorkspaceId } = useWorkspace();
  const isMobile = useIsMobile();
  const { can } = usePermissions();
  const {
    data: transactions = [],
    isLoading,
    update,
    remove,
  } = useTransactions(activeWorkspaceId, month, year);
  const [editTarget, setEditTarget] = useState<Transaction | null>(null);
  const canUpdate = can('transactions', 'update');

  const columns = useMemo(() => getTransactionColumns(t), [t]);

  const totals = useMemo(() => {
    const pago = transactions
      .filter((tx) => tx.status === 'pago')
      .reduce((s, tx) => s + tx.amount, 0);
    const pendente = transactions
      .filter((tx) => tx.status === 'pendente')
      .reduce((s, tx) => s + tx.amount, 0);
    const recebido = transactions
      .filter((tx) => tx.status === 'recebido')
      .reduce((s, tx) => s + tx.amount, 0);
    return { pago, pendente, recebido, saldo: recebido - pago };
  }, [transactions]);

  const categories = useMemo(
    () =>
      Array.from(
        new Map(
          transactions
            .filter((tx) => tx.categories)
            .map((tx) => [tx.categories!.id, tx.categories!])
        ).values()
      ),
    [transactions]
  );

  const filtered = useMemo(
    () =>
      transactions.filter(
        (transaction) =>
          (categoryFilter === 'all' ||
            transaction.category_id === categoryFilter) &&
          (statusFilter === 'all' || transaction.status === statusFilter)
      ),
    [categoryFilter, statusFilter, transactions]
  );

  const groupTotals = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const tx of filtered) {
      acc[tx.status] = (acc[tx.status] ?? 0) + tx.amount;
    }
    return acc;
  }, [filtered]);

  const sortedFiltered = useMemo(
    () =>
      [...filtered].sort(
        (a, b) =>
          (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99)
      ),
    [filtered]
  );

  useEffect(() => {
    if (!highlightId || isLoading) return;
    const element = document.getElementById(`transaction-${highlightId}`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlightId, isLoading, sortedFiltered]);

  const handleToggleStatus = async (id: string, status: TransactionStatus) => {
    try {
      await update.mutateAsync({ id, status });
      toast.success(
        status === 'pago' ? t('toast.markedPaid') : t('toast.markedPending')
      );
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
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Esquerda: filtro | recebido */}
        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:w-auto lg:items-center">
          {categories.length > 0 && (
            <>
              <Select
                value={categoryFilter}
                onValueChange={onCategoryFilterChange}
              >
                <SelectTrigger className="min-h-11 w-full sm:min-h-9 lg:w-48">
                  <SelectValue placeholder={t('table.filterByCategory')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t('table.allCategories')}
                  </SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="bg-border hidden h-5 w-px shrink-0 lg:block" />
            </>
          )}
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              onStatusFilterChange(value as TransactionStatus | 'all')
            }
          >
            <SelectTrigger className="min-h-11 w-full sm:min-h-9 lg:w-44">
              <SelectValue placeholder={t('table.filterByStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('table.allStatuses')}</SelectItem>
              <SelectItem value="pendente">{t('status.pendente')}</SelectItem>
              <SelectItem value="pago">{t('status.pago')}</SelectItem>
              <SelectItem value="recebido">{t('status.recebido')}</SelectItem>
            </SelectContent>
          </Select>
          <div
            className={cn(
              'flex min-h-11 items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-sm font-medium sm:col-span-2 lg:min-h-0',
              totals.saldo >= 0
                ? 'bg-green-500/15 text-green-600 dark:text-green-400'
                : 'bg-red-500/15 text-red-600 dark:text-red-400'
            )}
          >
            {totals.saldo >= 0 ? (
              <TrendingUp className="h-4 w-4 shrink-0" />
            ) : (
              <TrendingDown className="h-4 w-4 shrink-0" />
            )}
            <span>{t('status.saldo')}</span>
            <span className="font-semibold tabular-nums">
              {formatToBRL(totals.saldo)}
            </span>
          </div>
        </div>

        {/* Direita: pago + pendente empilhados */}
        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:w-auto lg:items-center">
          <div className="flex min-h-11 items-center justify-between gap-2 rounded-lg bg-green-500/15 px-3 py-1.5 text-sm font-medium text-green-600 lg:min-h-0 dark:text-green-400">
            <CircleCheck className="h-4 w-4 shrink-0" />
            <span>{t('status.pago')}</span>
            <span className="font-semibold tabular-nums">
              {formatToBRL(totals.pago)}
            </span>
          </div>
          <div className="flex min-h-11 items-center justify-between gap-2 rounded-lg bg-amber-500/15 px-3 py-1.5 text-sm font-medium text-amber-600 lg:min-h-0 dark:text-amber-400">
            <Clock className="h-4 w-4 shrink-0" />
            <span>{t('status.pendente')}</span>
            <span className="font-semibold tabular-nums">
              {formatToBRL(totals.pendente)}
            </span>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div
          data-slot="collection-empty-state"
          className="text-muted-foreground py-12 text-center"
        >
          <p className="text-lg font-medium">{t('table.empty')}</p>
          <p className="text-sm">{t('table.emptyHint')}</p>
          {(categoryFilter !== 'all' || statusFilter !== 'all') && (
            <button
              type="button"
              className="text-primary mt-4 min-h-11 rounded-md px-4 text-sm font-medium underline-offset-4 hover:underline"
              onClick={() => {
                onCategoryFilterChange('all');
                onStatusFilterChange('all');
              }}
            >
              {t('table.clearFilters')}
            </button>
          )}
        </div>
      ) : isMobile ? (
        <MobileRecordList aria-label={t('title')}>
          {sortedFiltered.map((transaction) => {
            const isIncome = transaction.type === 'receita';
            const isPaid = transaction.status === 'pago';
            const label =
              transaction.description ??
              transaction.categories?.name ??
              t('table.noDescription');

            return (
              <MobileRecordListItem
                key={transaction.id}
                id={`transaction-${transaction.id}`}
                className={cn(
                  'space-y-3',
                  transaction.id === highlightId &&
                    'outline-primary bg-primary/10 outline-1 -outline-offset-1'
                )}
              >
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{label}</p>
                    {transaction.categories && (
                      <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                        <CategoryIcon
                          name={transaction.categories.icon}
                          className="size-3 shrink-0"
                        />
                        <span className="truncate">
                          {transaction.categories.name}
                        </span>
                      </p>
                    )}
                  </div>
                  <span
                    className={cn(
                      'shrink-0 font-semibold tabular-nums',
                      isIncome ? 'text-green-600' : 'text-red-500'
                    )}
                  >
                    {isIncome ? '+' : '-'} {formatToBRL(transaction.amount)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  {transaction.status === 'recebido' ? (
                    <span className="rounded-full bg-green-500/15 px-3 py-1.5 text-xs font-medium text-green-600 dark:text-green-400">
                      {t('status.recebido')}
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={!canUpdate}
                      aria-label={
                        isPaid ? t('status.markPending') : t('status.markPaid')
                      }
                      onClick={() =>
                        canUpdate &&
                        handleToggleStatus(
                          transaction.id,
                          isPaid ? 'pendente' : 'pago'
                        )
                      }
                      className={cn(
                        'min-h-11 rounded-full px-3 text-xs font-medium',
                        isPaid
                          ? 'bg-green-500/15 text-green-600 dark:text-green-400'
                          : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                      )}
                    >
                      {isPaid ? t('status.pago') : t('status.pendente')}
                    </button>
                  )}

                  {transaction.origin === 'installment' ? (
                    <Link
                      to="/admin/installments"
                      search={{
                        highlight: transaction.installment_id ?? undefined,
                      }}
                      className="text-muted-foreground hover:text-foreground inline-flex min-h-11 items-center gap-2 rounded-md px-2 text-sm"
                      aria-label={t('table.viewInstallment')}
                    >
                      {t('table.goToInstallment')}
                      <ExternalLink className="size-4" />
                    </Link>
                  ) : (
                    <TransactionActionsCell
                      transaction={transaction}
                      onEdit={setEditTarget}
                      onDelete={handleDelete}
                    />
                  )}
                </div>
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
              {table.getRowModel().rows.map((row, index, rows) => {
                const isNewGroup =
                  index === 0 ||
                  rows[index - 1].original.status !== row.original.status;
                const config =
                  GROUP_CONFIG[
                    row.original.status as keyof typeof GROUP_CONFIG
                  ];
                return (
                  <Fragment key={row.id}>
                    {isNewGroup && config && (
                      <TableRow
                        className={cn('hover:bg-transparent', config.bgClass)}
                      >
                        <TableCell
                          colSpan={columns.length}
                          className="px-4 py-2"
                        >
                          <div
                            className={cn(
                              'flex items-center gap-2 text-sm font-semibold',
                              config.colorClass
                            )}
                          >
                            <config.Icon className="h-4 w-4" />
                            <span>
                              {t(
                                `status.${row.original.status}` as `status.${typeof row.original.status}`
                              )}
                            </span>
                            <span className="ml-auto font-medium tabular-nums">
                              {formatToBRL(
                                groupTotals[row.original.status] ?? 0
                              )}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow
                      id={`transaction-${row.original.id}`}
                      className={cn(
                        row.original.id === highlightId &&
                          'bg-primary/10 outline-primary outline-1 -outline-offset-1'
                      )}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={
                            cell.column.id === 'type' ||
                            cell.column.id === 'actions'
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
