import { useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Bell, CalendarClock } from 'lucide-react';
import { useTransactions, type Transaction } from '@/hooks/useTransactions';
import { useWorkspace } from '@/context/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { formatToBRL } from '@/utils/format';
import { getNomeMes } from '@/model/mes.enum';

const MAX_VISIBLE_ITEMS = 6;

function getTransactionPeriod(transaction: Transaction) {
  const [year, month] = transaction.date.split('-').map(Number);
  return { month, year };
}

export function NotificationBell() {
  const navigate = useNavigate();
  const { activeWorkspaceId } = useWorkspace();
  const [open, setOpen] = useState(false);
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const {
    data: transactions = [],
    isLoading,
    isError,
  } = useTransactions(activeWorkspaceId, month, year);

  const pendentes = useMemo(
    () =>
      transactions
        .filter(
          (transaction) =>
            transaction.type === 'despesa' && transaction.status === 'pendente'
        )
        .sort((a, b) => a.date.localeCompare(b.date)),
    [transactions]
  );

  const count = pendentes.length;
  const totalPendente = pendentes.reduce(
    (total, transaction) => total + transaction.amount,
    0
  );

  const openTransaction = (transaction: Transaction) => {
    const period = getTransactionPeriod(transaction);
    setOpen(false);
    navigate({
      to: '/admin/transactions',
      search: {
        ...period,
        status: 'pendente',
        highlight: transaction.id,
      },
    });
  };

  const openAllPending = () => {
    setOpen(false);
    navigate({
      to: '/admin/transactions',
      search: { month, year, status: 'pendente', highlight: undefined },
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative rounded-full"
          aria-label={
            count > 0
              ? `Pendências financeiras: ${count}`
              : 'Nenhuma pendência financeira'
          }
        >
          <Bell className={count > 0 ? 'text-amber-500' : undefined} />
          {count > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 min-w-4 px-1 py-0 text-[10px]"
            >
              {count > 9 ? '9+' : count}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex flex-col gap-1 p-4">
          <p className="font-semibold">Pendências financeiras</p>
          <p className="text-muted-foreground text-xs">
            {getNomeMes(month)} {year}
          </p>
        </div>
        <Separator />

        {!activeWorkspaceId ? (
          <p className="text-muted-foreground p-4 text-sm">
            Selecione um workspace para visualizar as pendências.
          </p>
        ) : isLoading ? (
          <div
            className="flex flex-col gap-3 p-4"
            aria-label="Carregando pendências"
          >
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : isError ? (
          <p className="text-destructive p-4 text-sm" role="alert">
            Não foi possível carregar as pendências.
          </p>
        ) : count === 0 ? (
          <div className="flex flex-col items-center gap-2 p-6 text-center">
            <CalendarClock className="text-muted-foreground size-5" />
            <p className="text-sm font-medium">Tudo em dia</p>
            <p className="text-muted-foreground text-xs">
              Não há despesas pendentes neste mês.
            </p>
          </div>
        ) : (
          <>
            <ul className="flex max-h-80 flex-col gap-1 overflow-y-auto p-2">
              {pendentes.slice(0, MAX_VISIBLE_ITEMS).map((transaction) => (
                <li key={transaction.id}>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-auto w-full justify-between px-2 py-2 text-left whitespace-normal"
                    onClick={() => openTransaction(transaction)}
                  >
                    <span className="flex min-w-0 flex-col items-start">
                      <span className="max-w-44 truncate font-medium">
                        {transaction.description || 'Despesa sem descrição'}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {transaction.categories?.name || 'Sem categoria'}
                      </span>
                    </span>
                    <span className="shrink-0 font-semibold text-amber-600">
                      {formatToBRL(transaction.amount)}
                    </span>
                  </Button>
                </li>
              ))}
            </ul>
            <Separator />
            <div className="flex flex-col gap-2 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total pendente</span>
                <span className="font-semibold">
                  {formatToBRL(totalPendente)}
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={openAllPending}
              >
                Ver todas as pendências
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
