import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

// components
import { TasksTable } from '@/components/TasksTable';
import { AddTaskDialog } from '@/components/AddTaskDialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Loading from '@/components/Loading';
import TituloPage from '@/components/TituloPage';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/animate-ui/components/tooltip';

// model & utils
import { getMesesLista } from '@/model/mes.enum';
import { TASK_STATUS } from '@/model/tasks.model';
import { formatToBRL } from '@/utils/format';

// services
import { getTasks } from '@/service/task/getTasks';
import { getTasksCountByMonth } from '@/service/task/getTasksCountByMonth';
import { queryKeys } from '@/lib/query-keys';

// icons
import { BanknoteArrowUp, ChevronLeft, ChevronRight } from 'lucide-react';

function Expenses() {
  const queryClient = useQueryClient();
  const { t } = useTranslation(['expenses', 'common']);
  const mesesLista = getMesesLista();

  const [mesAtivo, setMesAtivo] = useState(String(new Date().getMonth() + 1));
  const [anoAtivo, setAnoAtivo] = useState(new Date().getFullYear());

  // 🔄 Busca despesas do mês ativo
  const {
    data: tasksCurrentMonth = [],
    isFetching: isFetchingTasks,
    isError: isErrorTasks,
  } = useQuery({
    queryKey: queryKeys.tasks.list({
      month: parseInt(mesAtivo),
      year: anoAtivo,
    }),
    queryFn: () => getTasks({ month: parseInt(mesAtivo), year: anoAtivo }),
  });

  // 🔄 Busca meta por mês (contagem + recorrente) para ícones nos tabs
  const { data: monthsMeta } = useQuery({
    queryKey: queryKeys.tasks.countByMonth(anoAtivo),
    queryFn: () => getTasksCountByMonth(anoAtivo),
    staleTime: 1000 * 60 * 5,
  });

  // 💰 Calcula total pago do mês ativo diretamente das tasks
  const totalPago = tasksCurrentMonth
    .filter((t) => t.done === TASK_STATUS.Pago && t.price)
    .reduce((sum, t) => sum + Number(t.price), 0);

  // 💰 Total de todas as despesas do mês (independente do status)
  const totalDespesas = tasksCurrentMonth
    .filter((t) => t.price)
    .reduce((sum, t) => sum + Number(t.price), 0);

  // 🔄 Invalida cache e recarrega após alteração
  const handleTasksChange = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.list({
          month: parseInt(mesAtivo),
          year: anoAtivo,
        }),
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.countByMonth(anoAtivo),
      }),
    ]);
  }, [queryClient, mesAtivo, anoAtivo]);

  const prevYear = () => setAnoAtivo((y) => y - 1);
  const nextYear = () =>
    setAnoAtivo((y) => Math.min(y + 1, new Date().getFullYear() + 1));

  return (
    <div className="space-y-6">
      <TituloPage
        titulo={t('title')}
        subtitulo={t('subtitle')}
      />

      {/* Total pago + seletor de ano + botão adicionar */}
      <div className="flex flex-row items-center justify-between">
        {/* Total pago do mês ativo */}
        <div className="flex items-center gap-3">
          {isFetchingTasks ? (
            <span className="text-muted-foreground text-sm">{t('common:loading')}</span>
          ) : totalPago > 0 ? (
            <span className="flex items-center gap-2">
              {formatToBRL(totalPago)}
              <BanknoteArrowUp className="h-4 w-4" />
            </span>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <p className="text-muted-foreground cursor-pointer text-sm">
                    {t('noPayment')}
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  {tasksCurrentMonth.length > 0
                    ? t('noPaymentTooltip')
                    : t('noExpenses')}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Seletor de ano */}
          <div className="border-border flex h-10 items-center gap-1 rounded-md border px-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={prevYear}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center text-sm font-medium">
              {anoAtivo}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={nextYear}
              disabled={anoAtivo >= new Date().getFullYear() + 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <AddTaskDialog
            onTaskCreated={handleTasksChange}
            mesSelecionado={parseInt(mesAtivo)}
            anoSelecionado={anoAtivo}
          />
        </div>
      </div>

      {/* Seletor de meses — pills estilo MonthIncome */}
      <TooltipProvider>
        <div className="flex flex-wrap gap-2">
          {mesesLista.map((mes) => {
            const mesNumero = parseInt(mes.value);
            const ativo = mesAtivo === mes.value;
            const temDespesas = (monthsMeta?.count?.[mesNumero] ?? 0) > 0;
            const temRecorrente =
              monthsMeta?.hasRecorrente?.[mesNumero] ?? false;
            const names = monthsMeta?.recorrenteNames?.[mesNumero] ?? [];

            return (
              <Tooltip key={mes.value}>
                <TooltipTrigger>
                  <div
                    onClick={() => setMesAtivo(mes.value)}
                    className={`cursor-pointer rounded-full border px-3 py-1 text-[.75rem] uppercase ${
                      ativo || temDespesas
                        ? 'bg-primary border-primary'
                        : 'hover:bg-primary border-zinc-400 text-zinc-400 duration-200 hover:text-white'
                    }`}
                  >
                    {mes.label}
                    {temRecorrente && !ativo && (
                      <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-blue-400 align-middle" />
                    )}
                  </div>
                </TooltipTrigger>
                {temRecorrente && names.length > 0 && (
                  <TooltipContent>
                    <p className="mb-1 text-xs font-semibold">{t('recurring')}:</p>
                    {names.map((name) => (
                      <p key={name} className="text-xs">
                        • {name}
                      </p>
                    ))}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>

      {/* Conteúdo do mês ativo */}
      {isFetchingTasks ? (
        <Card>
          <CardContent>
            <Loading />
          </CardContent>
        </Card>
      ) : isErrorTasks ? (
        <Card>
          <CardContent>
            <p className="text-center text-sm text-red-500">
              {t('loadError')}
            </p>
          </CardContent>
        </Card>
      ) : tasksCurrentMonth.length > 0 ? (
        <Card>
          <CardContent>
            <TasksTable
              tasks={tasksCurrentMonth}
              total={tasksCurrentMonth.length}
              totalPrice={totalDespesas}
              onTasksChange={handleTasksChange}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <p className="text-muted-foreground text-center text-sm">
              {t('noExpensesForMonth', {
                month: mesesLista.find((m) => m.value === mesAtivo)?.label ?? mesAtivo,
              })}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default Expenses;
