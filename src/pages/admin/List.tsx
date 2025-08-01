import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// components
import { TasksTable } from '@/components/TasksTable';
import { AddTaskDialog } from '@/components/AddTaskDialog';
import { Card, CardContent } from '@/components/ui/card';
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
import { formatToBRL } from '@/utils/format';

// services
import { getTasks } from '@/service/task/getTasks';
import { totalPrice, totalItems } from '@/service/total';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';

// icons
import { BanknoteArrowUp, Loader } from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from '@/components/animate-ui/radix/tabs';
import { FaCheckCircle } from 'react-icons/fa';
import { useIA } from '@/hooks/use-ia';

function List() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [total, setTotal] = useState(0);
  const [price, setPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [mesAtivo, setMesAtivo] = useState(String(new Date().getMonth() + 1));
  const { data: iaData, isLoading: isLoadingIA } = useIA();

  const [form] = useState({
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear(),
  });

  // 🔄 Busca tarefas do mês ativo usando TanStack Query
  const { data: tasksCurrentMonth = [], refetch } = useQuery({
    queryKey: queryKeys.tasks.list({
      month: parseInt(mesAtivo),
      year: form.ano,
    }),
    queryFn: () => getTasks({ month: parseInt(mesAtivo), year: form.ano }),
  });

  // 🔄 Função para invalidar cache e recarregar dados
  const handleTasksChange = useCallback(async () => {
    console.log('🔄 Invalidando cache e recarregando dados...');

    // Invalida o cache do mês atual
    await queryClient.invalidateQueries({
      queryKey: queryKeys.tasks.list({
        month: parseInt(mesAtivo),
        year: form.ano,
      }),
    });

    // Força o refetch dos dados
    await refetch();

    // Atualiza os totais
    try {
      const [totalResult, priceResult] = await Promise.all([
        totalItems(),
        totalPrice(),
      ]);
      setTotal(totalResult);
      setPrice(priceResult);
    } catch (err) {
      console.error('Erro ao atualizar totais:', err);
    }

    console.log('✅ Cache invalidado e dados recarregados');
  }, [queryClient, mesAtivo, form.ano, refetch]);

  // 🔐 Verifica usuário e escuta logout
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) navigate({ to: '/login' });
    };

    const subscription = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate({ to: '/login' });
    }).data.subscription;

    checkUser();
    return () => subscription.unsubscribe();
  }, [navigate]);

  // 📊 Busca totais uma vez
  useEffect(() => {
    const fetchTotals = async () => {
      setIsLoading(true);
      try {
        const total = await totalPrice();
        setPrice(total);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTotals();
  }, []);

  return (
    <div className="space-y-6">
      <TituloPage titulo="Lista" />

      {/* Valor total pago + botão adicionar */}
      <div className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          {isLoadingIA || !iaData?.data?.rendimentoMes ? (
            <span className="flex items-center gap-2">
              <Loader className="h-4 w-4 animate-spin" />
              Carregando...
            </span>
          ) : iaData.data.rendimentoMes > 0 ? (
            <span className="flex gap-2">
              {formatToBRL(iaData.data.rendimentoMes)}
              <BanknoteArrowUp />
            </span>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <p className="cursor-pointer text-sm text-zinc-500">
                    Sem Pagamento Efetuado
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  {tasksCurrentMonth.length > 0
                    ? 'Mude o status na tabela para somar os valores pagos.'
                    : 'Nenhuma tarefa encontrada.'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <AddTaskDialog onTaskCreated={handleTasksChange} />
      </div>

      <Tabs value={mesAtivo} onValueChange={setMesAtivo}>
        <TabsList className="gap-1">
          {MESES_LISTA.map((mes) => {
            const temTarefas =
              mes.value === mesAtivo && tasksCurrentMonth.length > 0;

            return (
              <TabsTrigger key={mes.value} value={mes.value} className="gap-2">
                {temTarefas && <FaCheckCircle />}
                {mes.label}
              </TabsTrigger>
            );
          })}
        </TabsList>
        <TabsContents>
          {MESES_LISTA.map((mes) => (
            <TabsContent key={mes.value} value={mes.value}>
              {isLoading && mes.value === mesAtivo ? (
                <Card>
                  <CardContent>
                    <Loading />
                  </CardContent>
                </Card>
              ) : mes.value === mesAtivo && tasksCurrentMonth.length > 0 ? (
                <Card>
                  <CardContent>
                    <TasksTable
                      tasks={tasksCurrentMonth}
                      total={total}
                      totalPrice={price}
                      onTasksChange={handleTasksChange}
                    />
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent>
                    <p className="text-center text-sm text-zinc-500">
                      Nenhum item encontrada para {mes.label}.
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

export default List;
