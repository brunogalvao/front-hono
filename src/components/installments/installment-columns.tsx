import { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { TFunction } from 'i18next';
import { CreditCard, CheckCircle, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
import type { Installment } from '@/hooks/useInstallments';

interface ColumnOpts {
  canAct: boolean;
  onEdit: (item: Installment) => void;
  onPayoff: (item: Installment) => void;
  onDelete: (id: string) => void;
}

function ActionsCell({
  item,
  onEdit,
  onPayoff,
  onDelete,
}: {
  item: Installment;
  onEdit: (item: Installment) => void;
  onPayoff: (item: Installment) => void;
  onDelete: (id: string) => void;
}) {
  const { t } = useTranslation(['installments', 'common']);
  const [payoffOpen, setPayoffOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const pendingCount = item.total_installments - item.paid_installments;
  const pendingTotal = pendingCount * item.installment_amount;

  return (
    <>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(item)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1 text-xs"
          onClick={() => setPayoffOpen(true)}
        >
          <CheckCircle className="h-3 w-3" />
          {t('payoffEarly')}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive gap-1 text-xs"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="h-3 w-3" />
          {t('deleteSeries')}
        </Button>
      </div>

      <AlertDialog open={payoffOpen} onOpenChange={setPayoffOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('payoff.title')}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-1">
                <p>
                  <Trans
                    ns="installments"
                    i18nKey={pendingCount === 1 ? 'payoff.descOne' : 'payoff.descMany'}
                    values={{ count: pendingCount, amount: formatToBRL(pendingTotal) }}
                    components={{ bold: <strong /> }}
                  />
                </p>
                <p>{t('payoff.warning')}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common:cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onPayoff(item);
                setPayoffOpen(false);
              }}
            >
              {t('payoff.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-1">
                <p>
                  <Trans
                    ns="installments"
                    i18nKey={
                      item.total_installments === 1 ? 'deleteDialog.descOne' : 'deleteDialog.descMany'
                    }
                    values={{ count: item.total_installments }}
                    components={{ bold: <strong /> }}
                  />
                </p>
                <p>{t('deleteDialog.warning')}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common:cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                onDelete(item.id);
                setDeleteOpen(false);
              }}
            >
              {t('deleteSeries')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

const statusVariant = {
  active: 'default' as const,
  completed: 'secondary' as const,
  cancelled: 'outline' as const,
};

export function getInstallmentColumns(
  t: TFunction<['installments', 'common']>,
  opts: ColumnOpts,
): ColumnDef<Installment>[] {
  return [
    {
      id: 'icon',
      enableSorting: false,
      header: () => null,
      cell: () => (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20">
          <CreditCard className="h-5 w-5" />
        </div>
      ),
    },
    {
      id: 'name',
      enableSorting: false,
      header: t('table.colName'),
      cell: ({ row }) => {
        const { description, categories, status } = row.original;
        return (
          <div className="flex flex-col gap-0.5">
            <span className={cn('font-medium leading-tight', status !== 'active' && 'opacity-70')}>
              {description}
            </span>
            {categories && (
              <span className="text-muted-foreground text-xs">{categories.name}</span>
            )}
          </div>
        );
      },
    },
    {
      id: 'amount',
      enableSorting: false,
      header: t('table.colAmount'),
      cell: ({ row }) => {
        const { installment_amount, total_amount } = row.original;
        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold tabular-nums text-red-500">
              {formatToBRL(installment_amount)}
              {t('perMonth')}
            </span>
            <span className="text-muted-foreground text-xs tabular-nums">
              {formatToBRL(total_amount)} {t('totalSuffix')}
            </span>
          </div>
        );
      },
    },
    {
      id: 'progress',
      enableSorting: false,
      header: t('table.colProgress'),
      cell: ({ row }) => {
        const { paid_installments, total_installments } = row.original;
        const progress = (paid_installments / total_installments) * 100;
        const remaining = total_installments - paid_installments;
        return (
          <div className="w-40 space-y-1">
            <div className="text-muted-foreground flex justify-between text-xs">
              <span>{t('progress', { paid: paid_installments, total: total_installments })}</span>
              <span>{remaining > 0 ? t('remaining', { count: remaining }) : t('done')}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        );
      },
    },
    {
      id: 'status',
      enableSorting: false,
      header: t('table.colStatus'),
      cell: ({ row }) => {
        const { status } = row.original;
        return <Badge variant={statusVariant[status]}>{t(`status.${status}`)}</Badge>;
      },
    },
    ...(opts.canAct
      ? [
          {
            id: 'actions',
            enableSorting: false,
            header: t('table.colActions'),
            cell: ({ row }: { row: { original: Installment } }) => {
              if (row.original.status !== 'active') return null;
              return (
                <ActionsCell
                  item={row.original}
                  onEdit={opts.onEdit}
                  onPayoff={opts.onPayoff}
                  onDelete={opts.onDelete}
                />
              );
            },
          } satisfies ColumnDef<Installment>,
        ]
      : []),
  ];
}
