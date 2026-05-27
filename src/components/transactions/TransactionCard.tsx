import { useState } from 'react';
import { Pencil, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
import { useWorkspace } from '@/context/WorkspaceContext';
import type { Transaction } from '@/hooks/useTransactions';

interface TransactionCardProps {
  transaction: Transaction;
  currentUserId: string;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionCard({
  transaction,
  currentUserId,
  onEdit,
  onDelete,
}: TransactionCardProps) {
  const { activeRole } = useWorkspace();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const canEdit = canEditTransaction(activeRole, transaction.created_by, currentUserId);
  const isReceita = transaction.type === 'receita';

  const formattedDate = new Date(transaction.date + 'T00:00:00').toLocaleDateString('pt-BR');
  const formattedAmount = formatToBRL(transaction.amount);

  return (
    <>
      <Card className="transition-shadow hover:shadow-sm">
        <CardContent className="flex items-center gap-4 p-4">
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
              isReceita ? 'bg-green-100 text-green-600 dark:bg-green-900/20' : 'bg-red-100 text-red-600 dark:bg-red-900/20',
            )}
          >
            {isReceita ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
          </div>

          <div className="flex-1 space-y-0.5">
            <p className="font-medium leading-tight">
              {transaction.description ?? transaction.categories?.name ?? 'Sem descrição'}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs">{formattedDate}</span>
              {transaction.categories && (
                <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                  <CategoryIcon name={transaction.categories.name} className="h-2.5 w-2.5" />
                  {transaction.categories.name}
                </Badge>
              )}
              {transaction.origin !== 'manual' && (
                <Badge variant="outline" className="text-xs">
                  {transaction.origin === 'recurring' ? 'Recorrente' : 'Parcela'}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={cn(
                'font-semibold tabular-nums',
                isReceita ? 'text-green-600' : 'text-red-500',
              )}
            >
              {isReceita ? '+' : '-'} {formattedAmount}
            </span>

            {canEdit && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onEdit(transaction)}
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
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir transação?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A transação será removida permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                onDelete(transaction.id);
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
