import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { TFunction } from 'i18next';
import { Pencil, RefreshCw, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { formatToBRL } from '@/utils/format';
import { CategoryIcon } from '@/lib/category-icons';
import type { RecurringExpense } from '@/hooks/useRecurring';

interface ColumnOpts {
  canAct: boolean;
  onEdit: (item: RecurringExpense) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, current: boolean) => void;
}

function ActionsCell({
  item,
  onEdit,
  onDelete,
  onToggle,
}: {
  item: RecurringExpense;
  onEdit: (item: RecurringExpense) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, current: boolean) => void;
}) {
  const { t } = useTranslation(['recurring', 'common']);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-1">
        <Switch
          checked={item.is_active}
          onCheckedChange={() => onToggle(item.id, item.is_active)}
          aria-label={t('actions.toggleAria')}
        />
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(item)}>
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
            <AlertDialogTitle>{t('delete.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('delete.description')}
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
              {t('common:delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function getRecurringColumns(
  t: TFunction<['recurring', 'common']>,
  opts: ColumnOpts,
): ColumnDef<RecurringExpense>[] {
  return [
    {
      id: 'icon',
      enableSorting: false,
      header: () => null,
      cell: () => (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/20">
          <RefreshCw className="h-5 w-5" />
        </div>
      ),
    },
    {
      id: 'name',
      enableSorting: false,
      header: t('table.colName'),
      accessorKey: 'description',
      cell: ({ row }) => {
        const { description, categories, is_active } = row.original;
        return (
          <div className="flex flex-col gap-0.5">
            <span className={cn('font-medium leading-tight', !is_active && 'line-through opacity-60')}>
              {description}
            </span>
            {categories && (
              <span className="text-muted-foreground flex items-center gap-1 text-xs">
                <CategoryIcon name={categories.icon} className="h-3 w-3" />
                {categories.name}
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: 'amount',
      enableSorting: false,
      header: t('table.colAmount'),
      cell: ({ row }) => (
        <span className="font-semibold tabular-nums text-red-500">
          - {formatToBRL(row.original.amount)}
        </span>
      ),
    },
    {
      id: 'frequency',
      enableSorting: false,
      header: t('table.colFrequency'),
      cell: ({ row }) => (
        <Badge variant="outline">{t(`frequency.${row.original.frequency}`)}</Badge>
      ),
    },
    {
      id: 'status',
      enableSorting: false,
      header: t('table.colStatus'),
      cell: ({ row }) => {
        const { is_active } = row.original;
        return (
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-medium',
              is_active
                ? 'bg-green-500/15 text-green-600 dark:text-green-400'
                : 'bg-muted text-muted-foreground',
            )}
          >
            {is_active ? t('status.active') : t('status.inactive')}
          </span>
        );
      },
    },
    ...(opts.canAct
      ? [
          {
            id: 'actions',
            enableSorting: false,
            header: t('table.colActions'),
            cell: ({ row }: { row: { original: RecurringExpense } }) => (
              <ActionsCell
                item={row.original}
                onEdit={opts.onEdit}
                onDelete={opts.onDelete}
                onToggle={opts.onToggle}
              />
            ),
          } satisfies ColumnDef<RecurringExpense>,
        ]
      : []),
  ];
}
