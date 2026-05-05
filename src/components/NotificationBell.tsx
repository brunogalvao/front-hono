import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { queryKeys } from '@/lib/query-keys';
import { getTasksPendentes } from '@/service/task/getTasksPendentes';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Bell } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { formatToBRL } from '@/utils/format';
import { cn } from '@/lib/utils';
import type { Task } from '@/model/tasks.model';
import { getNomeMes } from '@/model/mes.enum';

export function NotificationBell() {
  const navigate = useNavigate();
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const { data: pendentes = [] } = useQuery({
    queryKey: queryKeys.notifications.pending(month, year),
    queryFn: () => getTasksPendentes({ month, year }),
    staleTime: 1000 * 60 * 5,
  });

  const count = pendentes.length;
  const totalPendente = pendentes.reduce((acc, t) => acc + (t.price ?? 0), 0);

  const handleTaskClick = (task: Task) => {
    sessionStorage.setItem('highlightTaskId', task.id);
    navigate({ to: '/admin/expenses' });
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          to="/admin/expenses"
          className="hover:bg-accent relative flex h-9 w-9 items-center justify-center rounded-full transition-colors"
        >
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
        </Link>
      </TooltipTrigger>

      <TooltipContent side="bottom" align="end" className="max-w-72 p-3">
        {count === 0 ? (
          <p className="text-xs">Nenhuma despesa pendente</p>
        ) : (
          <div className="min-w-56">
            <div className="mb-2">
              <p className="text-sm font-semibold">Despesas pendentes</p>
              <p className="text-muted-foreground text-xs">
                {getNomeMes(month)} {year}
              </p>
            </div>
            <Separator className="mb-2" />
            <ul className="space-y-1">
              {pendentes.map((task) => (
                <li
                  key={task.id}
                  onClick={() => handleTaskClick(task)}
                  className="hover:bg-accent/20 flex cursor-pointer items-start justify-between gap-4 rounded px-1 py-1.5 transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-medium">{task.title}</span>
                    {task.type && (
                      <span className="text-muted-foreground text-[11px]">{task.type}</span>
                    )}
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-amber-400">
                    {task.price != null ? formatToBRL(task.price) : '—'}
                  </span>
                </li>
              ))}
            </ul>
            <Separator className="my-2" />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs">Total pendente</span>
              <span className="text-xs font-bold text-red-400">
                {formatToBRL(totalPendente)}
              </span>
            </div>
            <p className="text-muted-foreground mt-2 text-center text-[11px]">
              Clique em uma despesa para destacá-la
            </p>
          </div>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
