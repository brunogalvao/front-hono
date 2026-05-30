import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import type { ColumnDef, RowData } from '@tanstack/react-table';
import {
  TrendingDown,
  TrendingUp,
  Pencil,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { formatToBRL } from '@/utils/format';
import { CategoryIcon } from '@/lib/category-icons';
import { canEditTransaction } from '@/lib/permissions';
import type { Transaction, TransactionStatus } from '@/hooks/useTransactions';

type WorkspaceRole = 'administrador' | 'operador' | 'visualizador';

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    currentUserId: string;
    activeRole: WorkspaceRole | null;
    onEdit: (transaction: Transaction) => void;
    onDelete: (id: string) => void;
    onToggleStatus: (id: string, status: TransactionStatus) => void;
  }
}

function ActionsCell({
  row,
  table,
}: {
  row: { original: Transaction };
  table: {
    options: {
      meta?: {
        currentUserId: string;
        activeRole: WorkspaceRole | null;
        onEdit: (t: Transaction) => void;
        onDelete: (id: string) => void;
      };
    };
  };
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const meta = table.options.meta;
  if (!meta) return null;

  const canEdit = canEditTransaction(
    meta.activeRole,
    row.original.created_by,
    meta.currentUserId
  );
  if (!canEdit || row.original.origin === 'installment') return null;

  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => meta.onEdit(row.original)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive h-8 w-8"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir transação?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A transação será removida
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                meta.onDelete(row.original.id);
                setDeleteOpen(false);
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function getTransactionColumns(): ColumnDef<Transaction>[] {
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
                : 'bg-red-100 text-red-600 dark:bg-red-900/20'
            )}
          >
            {isReceita ? (
              <TrendingUp className="h-5 w-5" />
            ) : (
              <TrendingDown className="h-5 w-5" />
            )}
          </div>
        );
      },
    },
    {
      id: 'name',
      enableSorting: false,
      header: 'Nome',
      accessorFn: (row) =>
        row.description ?? row.categories?.name ?? 'Sem descrição',
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
      header: 'Tipo',
      cell: ({ row }) => {
        const { origin, installment_number, installments } = row.original;
        if (origin === 'recurring') {
          return <Badge variant="outline">Recorrente</Badge>;
        }
        if (origin === 'installment') {
          const label =
            installment_number && installments?.total_installments
              ? `Parcelado ${installment_number}/${installments.total_installments}`
              : 'Parcelado';
          return (
            <div className="flex items-center gap-1.5">
              <Badge variant="outline">{label}</Badge>
            </div>
          );
        }
        return <Badge variant="secondary">Manual</Badge>;
      },
    },
    {
      id: 'status',
      enableSorting: false,
      header: 'Status',
      cell: ({ row, table }) => {
        const meta = table.options.meta;
        if (!meta) return null;
        const canEdit = canEditTransaction(
          meta.activeRole,
          row.original.created_by,
          meta.currentUserId
        );
        const isPago = row.original.status === 'pago';
        return (
          <button
            type="button"
            disabled={!canEdit}
            aria-label={isPago ? 'Marcar como pendente' : 'Marcar como pago'}
            onClick={() =>
              canEdit &&
              meta.onToggleStatus(row.original.id, isPago ? 'pendente' : 'pago')
            }
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-medium transition-colors',
              isPago
                ? 'bg-green-500/15 text-green-600 dark:text-green-400'
                : 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
              canEdit && 'cursor-pointer hover:opacity-80',
              !canEdit && 'cursor-default'
            )}
          >
            {isPago ? 'Pago' : 'Pendente'}
          </button>
        );
      },
    },
    {
      id: 'amount',
      enableSorting: false,
      header: 'Valor',
      cell: ({ row }) => {
        const isReceita = row.original.type === 'receita';
        return (
          <span
            className={cn(
              'font-semibold tabular-nums',
              isReceita ? 'text-green-600' : 'text-red-500'
            )}
          >
            {isReceita ? '+' : '-'} {formatToBRL(row.original.amount)}
          </span>
        );
      },
    },
    {
      id: 'actions',
      enableSorting: false,
      header: 'Ações',
      cell: ({ row, table }) => {
        const { origin } = row.original;
        if (origin === 'recurring') {
          return (
            <ActionsCell
              row={row}
              table={table as Parameters<typeof ActionsCell>[0]['table']}
            />
          );
        }
        if (origin === 'installment') {
          const installmentId = row.original.installment_id;
          return (
            <Link
              to="/admin/installments"
              search={{ highlight: installmentId ?? undefined }}
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 transition-colors"
              title="Ver parcelamento"
            >
              Ir para a Parcela
              <ExternalLink className="h-4 w-4" />
            </Link>
          );
        }
        return (
          <ActionsCell
            row={row}
            table={table as Parameters<typeof ActionsCell>[0]['table']}
          />
        );
      },
    },
  ];
}
