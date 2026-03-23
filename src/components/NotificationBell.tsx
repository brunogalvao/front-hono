import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getTasksPendentes } from '@/service/task/getTasksPendentes';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatToBRL } from '@/utils/format';
import { cn } from '@/lib/utils';

const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export function NotificationBell() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const { data: pendentes = [] } = useQuery({
    queryKey: queryKeys.notifications.pending(month, year),
    queryFn: () => getTasksPendentes({ month, year }),
    staleTime: 1000 * 60 * 5, // 5 min
  });

  const count = pendentes.length;
  const totalPendente = pendentes.reduce((acc, t) => acc + (t.price ?? 0), 0);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="hover:bg-accent relative flex h-9 w-9 items-center justify-center rounded-full transition-colors">
              <Bell
                className={cn(
                  'size-5',
                  count > 0 ? 'text-amber-500' : 'text-muted-foreground'
                )}
              />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </button>
          </TooltipTrigger>
          {count === 0 && (
            <TooltipContent side="bottom">
              Nenhuma despesa pendente
            </TooltipContent>
          )}
        </Tooltip>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Despesas pendentes</p>
            <p className="text-muted-foreground text-xs">
              {MESES[month - 1]} {year}
            </p>
          </div>
          {count > 0 && (
            <Badge variant="destructive" className="text-xs">
              {count} pendente{count > 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        <Separator />

        {count === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Bell className="text-muted-foreground size-8" />
            <p className="text-muted-foreground text-sm">
              Nenhuma despesa pendente este mês.
            </p>
          </div>
        ) : (
          <>
            <ul className="max-h-64 divide-y overflow-y-auto">
              {pendentes.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{task.title}</span>
                    {task.type && (
                      <span className="text-muted-foreground text-xs">
                        {task.type}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-amber-500">
                    {task.price != null ? formatToBRL(task.price) : '—'}
                  </span>
                </li>
              ))}
            </ul>

            <Separator />

            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-muted-foreground text-xs">
                Total pendente
              </span>
              <span className="text-sm font-bold text-red-500">
                {formatToBRL(totalPendente)}
              </span>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
