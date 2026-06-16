import { Link } from '@tanstack/react-router';
import type { ColumnDef, RowData } from '@tanstack/react-table';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { TrendingDown, TrendingUp, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatToBRL } from '@/utils/format';
import { CategoryIcon } from '@/lib/category-icons';
import { usePermissions } from '@/hooks/usePermissions';
import { TransactionActionsCell } from './TransactionActionsCell';
import type { Transaction, TransactionStatus } from '@/hooks/useTransactions';

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    onEdit: (transaction: Transaction) => void;
    onDelete: (id: string) => void;
    onToggleStatus: (id: string, status: TransactionStatus) => void;
  }
}

function StatusCell({
  row,
  table,
}: {
  row: { original: Transaction };
  table: { options: { meta?: { onToggleStatus: (id: string, status: TransactionStatus) => void } } };
}) {
  const { t } = useTranslation('transactions');
  const { can } = usePermissions();
  const canUpdate = can('transactions', 'update');
  const { status } = row.original;
  const meta = table.options.meta;

  // 'recebido' is auto-set for income — not togglable
  if (status === 'recebido') {
    return (
      <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-green-500/15 text-green-600 dark:text-green-400 cursor-default">
        {t('status.recebido')}
      </span>
    );
  }

  const isPago = status === 'pago';

  return (
    <button
      type="button"
      disabled={!canUpdate}
      aria-label={isPago ? t('status.markPending') : t('status.markPaid')}
      onClick={() => canUpdate && meta?.onToggleStatus(row.original.id, isPago ? 'pendente' : 'pago')}
      className={cn(
        'rounded-full px-2 py-0.5 text-xs font-medium transition-colors',
        isPago
          ? 'bg-green-500/15 text-green-600 dark:text-green-400'
          : 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
        canUpdate && 'cursor-pointer hover:opacity-80',
        !canUpdate && 'cursor-default',
      )}
    >
      {isPago ? t('status.pago') : t('status.pendente')}
    </button>
  );
}

export function getTransactionColumns(t: TFunction<'transactions'>): ColumnDef<Transaction>[] {
  return [
    {
      id: 'icon',
      enableSorting: false,
      header: () => null,
      cell: ({ row }) => {
        const isReceita = row.original.type === 'receita';
        return (
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
              isReceita
                ? 'bg-green-100 text-green-600 dark:bg-green-900/20'
                : 'bg-red-100 text-red-600 dark:bg-red-900/20',
            )}
          >
            {isReceita ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
          </div>
        );
      },
    },
    {
      id: 'name',
      enableSorting: false,
      header: t('table.name'),
      accessorFn: (row) => row.description ?? row.categories?.name ?? t('table.noDescription'),
      cell: ({ row, getValue }) => {
        const category = row.original.categories;
        return (
          <div className="flex flex-col gap-0.5">
            <span className="leading-tight font-medium">{getValue<string>()}</span>
            {category && (
              <span className="text-muted-foreground flex items-center gap-1 text-xs">
                <CategoryIcon name={category.icon} className="h-3 w-3" />
                {category.name}
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: 'type',
      enableSorting: false,
      header: t('table.colType'),
      cell: ({ row }) => {
        const { origin, installment_number, installments } = row.original;
        if (origin === 'recurring') return <Badge variant="outline">{t('origin.recurring')}</Badge>;
        if (origin === 'installment') {
          const label =
            installment_number && installments?.total_installments
              ? t('origin.installmentCount', { current: installment_number, total: installments.total_installments })
              : t('origin.installment');
          return <Badge variant="outline">{label}</Badge>;
        }
        return <Badge variant="secondary">{t('origin.manual')}</Badge>;
      },
    },
    {
      id: 'status',
      enableSorting: false,
      header: t('table.colStatus'),
      cell: ({ row, table }) => <StatusCell row={row} table={table} />,
    },
    {
      id: 'amount',
      enableSorting: false,
      header: t('table.colAmount'),
      cell: ({ row }) => {
        const isReceita = row.original.type === 'receita';
        return (
          <span className={cn('font-semibold tabular-nums', isReceita ? 'text-green-600' : 'text-red-500')}>
            {isReceita ? '+' : '-'} {formatToBRL(row.original.amount)}
          </span>
        );
      },
    },
    {
      id: 'actions',
      enableSorting: false,
      header: t('table.colActions'),
      cell: ({ row, table }) => {
        const meta = table.options.meta;
        if (!meta) return null;
        const { origin } = row.original;

        if (origin === 'installment') {
          return (
            <Link
              to="/admin/installments"
              search={{ highlight: row.original.installment_id ?? undefined }}
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 transition-colors"
              title={t('table.viewInstallment')}
            >
              {t('table.goToInstallment')}
              <ExternalLink className="h-4 w-4" />
            </Link>
          );
        }

        return (
          <TransactionActionsCell
            transaction={row.original}
            onEdit={meta.onEdit}
            onDelete={meta.onDelete}
          />
        );
      },
    },
  ];
}
