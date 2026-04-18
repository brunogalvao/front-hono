import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

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
import { MESES_LISTA } from '@/model/mes.enum';
import { TASK_STATUS } from '@/model/tasks.model';
import { formatToBRL } from '@/utils/format';

// services
import { getTasks } from '@/service/task/getTasks';
import { getTasksCountByMonth } from '@/service/task/getTasksCountByMonth';
import { queryKeys } from '@/lib/query-keys';

// icons
import {
  BanknoteArrowUp,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CircleCheck,
} from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from '@/components/animate-ui/radix/tabs';

function Expenses() {
  const queryClient = useQueryClient();

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
        titulo="Despesas"
        subtitulo="Gerencie suas despesas mensais"
      />

      {/* Total pago + seletor de ano + botão adicionar */}
      <div className="flex flex-row items-center justify-between">
        {/* Total pago do mês ativo */}
        <div className="flex items-center gap-3">
          {isFetchingTasks ? (
            <span className="text-muted-foreground text-sm">Carregando...</span>
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
                    Sem Pagamento Efetuado
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  {tasksCurrentMonth.length > 0
                    ? 'Mude o status na tabela para somar os valores pagos.'
                    : 'Nenhuma despesa encontrada.'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Seletor de ano */}
          <div className="border-border flex items-center gap-1 rounded-md border px-1">
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

      <Tabs value={mesAtivo} onValueChange={setMesAtivo}>
        <TabsList className="gap-1">
          {MESES_LISTA.map((mes) => {
            const mesNumero = parseInt(mes.value);
            const temDespesas = (monthsMeta?.count?.[mesNumero] ?? 0) > 0;
            const temRecorrente =
              monthsMeta?.hasRecorrente?.[mesNumero] ?? false;
            const names = monthsMeta?.recorrenteNames?.[mesNumero] ?? [];

            const icon = temRecorrente ? (
              <RefreshCw className="h-3 w-3 shrink-0 text-blue-400" />
            ) : temDespesas ? (
              <CircleCheck className="h-3 w-3 shrink-0" />
            ) : null;

            return (
              <TooltipProvider key={mes.value}>
                <Tooltip>
                  <TooltipTrigger>
                    <span>
                      <TabsTrigger
                        value={mes.value}
                        className="data-[state=active]:bg-primary gap-1.5"
                      >
                        {icon}
                        {mes.label}
                      </TabsTrigger>
                    </span>
                  </TooltipTrigger>
                  {temRecorrente && names.length > 0 && (
                    <TooltipContent>
                      <p className="mb-1 text-xs font-semibold">Recorrentes:</p>
                      {names.map((name) => (
                        <p key={name} className="text-xs">
                          • {name}
                        </p>
                      ))}
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </TabsList>
        <TabsContents>
          {MESES_LISTA.map((mes) => (
            <TabsContent key={mes.value} value={mes.value}>
              {isFetchingTasks && mes.value === mesAtivo ? (
                <Card>
                  <CardContent>
                    <Loading />
                  </CardContent>
                </Card>
              ) : isErrorTasks && mes.value === mesAtivo ? (
                <Card>
                  <CardContent>
                    <p className="text-center text-sm text-red-500">
                      Erro ao carregar despesas. Verifique sua conexão e tente
                      novamente.
                    </p>
                  </CardContent>
                </Card>
              ) : mes.value === mesAtivo && tasksCurrentMonth.length > 0 ? (
                <Card>
                  <CardContent>
                    <TasksTable
                      tasks={tasksCurrentMonth}
                      total={tasksCurrentMonth.length}
                      totalPrice={totalPago}
                      onTasksChange={handleTasksChange}
                    />
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent>
                    <p className="text-muted-foreground text-center text-sm">
                      Nenhuma despesa encontrada para {mes.label}.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </TabsContents>
      </Tabs>
    </div>
  );
}

export default Expenses;
