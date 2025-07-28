import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// components
import { TasksTable } from "@/components/TasksTable";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import { Card, CardContent } from "@/components/ui/card";
import Loading from "@/components/Loading";
import TituloPage from "@/components/TituloPage";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/animate-ui/components/tooltip";

// model & utils
import type { Task } from "@/model/tasks.model";
import { MESES_LISTA } from "@/model/mes.enum";
import { formatToBRL } from "@/utils/format";

// services
import { getTasks } from "@/service/task/getTasks";
import { totalPrice, totalItems, totalPaid } from "@/service/total";
import { supabase } from "@/lib/supabase";

// icons
import { BanknoteArrowUp, Loader } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from "@/components/animate-ui/radix/tabs";
import { FaCheckCircle } from "react-icons/fa";

function List() {
  const navigate = useNavigate();

  const [tasksPorMes, setTasksPorMes] = useState<Record<string, Task[]>>({});
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [price, setPrice] = useState(0);
  const [paid, setPaid] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [mesAtivo, setMesAtivo] = useState(String(new Date().getMonth() + 1));
  const [loadedMonths, setLoadedMonths] = useState<Set<string>>(new Set());

  const [form] = useState({
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear(),
  });

  // 🔄 Busca tarefas conforme mês/ano
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      await getTasks({ month: form.mes, year: form.ano });
      // Não precisamos mais desta função, mas mantemos para compatibilidade
    } catch (err) {
      console.error("Erro ao carregar tarefas:", err);
    } finally {
      setLoading(false);
    }
  }, [form]);

  // 🔄 Carrega tarefas de um mês específico sob demanda
  const fetchTasksForMonth = useCallback(async (month: string, year: number) => {
    const monthKey = `${month}-${year}`;
    
    // Se já foi carregado, não carrega novamente
    if (loadedMonths.has(monthKey)) {
      return;
    }

    try {
      const data = await getTasks({
        month: parseInt(month),
        year: year,
      });
      
      setTasksPorMes(prev => ({
        ...prev,
        [month]: data
      }));
      
      setLoadedMonths(prev => new Set([...prev, monthKey]));
    } catch (err) {
      console.error(`Erro ao carregar tarefas do mês ${month}:`, err);
    }
  }, [loadedMonths]);

  // 🔄 Totais (geral)
  const updateTotalData = useCallback(async () => {
    try {
      const [totalResult, priceResult, resultPaid] = await Promise.all([
        totalItems(),
        totalPrice(),
        totalPaid(),
      ]);
      setTotal(totalResult);
      setPrice(priceResult);
      setPaid(resultPaid);
    } catch (err) {
      console.error("Erro ao atualizar totais:", err);
    }
  }, []);

  // 🔄 Função memoizada para atualizar tarefas de um mês específico
  const createTasksChangeHandler = useCallback((month: string) => {
    return async () => {
      console.log("🔄 Atualizando tarefas do mês:", month);
      
      // Limpa o cache do mês para forçar recarregamento
      setLoadedMonths(prev => {
        const newSet = new Set(prev);
        newSet.delete(`${month}-${form.ano}`);
        return newSet;
      });
      
      // Recarrega as tarefas do mês
      await fetchTasksForMonth(month, form.ano);
      
      // Atualiza os totais
      await updateTotalData();
      
      console.log("✅ Atualização concluída para o mês:", month);
    };
  }, [fetchTasksForMonth, form.ano, updateTotalData]);

  // 🔐 Verifica usuário e escuta logout
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) navigate("/login");
    };

    const subscription = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/login");
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
        const paid = await totalPaid();
        setPrice(total);
        setPaid(paid);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTotals();
    updateTotalData();
  }, [updateTotalData]);

  // 📅 Recarrega tarefas ao mudar mês/ano
  useEffect(() => {
    if (form.mes && form.ano) fetchTasks();
  }, [form, fetchTasks]);

  // 📅 Carrega o mês ativo quando mudar
  useEffect(() => {
    if (mesAtivo && form.ano) {
      fetchTasksForMonth(mesAtivo, form.ano);
    }
  }, [mesAtivo, form.ano, fetchTasksForMonth]);

  // 🎯 Carrega o mês atual na inicialização
  useEffect(() => {
    const currentMonth = String(new Date().getMonth() + 1);
    const currentYear = new Date().getFullYear();
    fetchTasksForMonth(currentMonth, currentYear);
  }, [fetchTasksForMonth]);

  // 📊 Memoiza os totais para evitar recálculos desnecessários
  const currentMonthTasks = useMemo(() => {
    return tasksPorMes[mesAtivo] || [];
  }, [tasksPorMes, mesAtivo]);

  return (
    <div className="space-y-6">
      <TituloPage titulo="Lista" />

      {/* Valor total pago + botão adicionar */}
      <div className="flex flex-row justify-between items-center">
        <div className="flex gap-3 items-center">
          {isLoading || paid == null ? (
            <span className="flex items-center gap-2">
              <Loader className="h-4 w-4 animate-spin" />
              Carregando...
            </span>
          ) : paid > 0 ? (
            <span className="flex gap-2">
              {formatToBRL(paid)}
              <BanknoteArrowUp />
            </span>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <p className="text-sm text-zinc-500 cursor-pointer">
                    Sem Pagamento Efetuado
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  {currentMonthTasks.length > 0
                    ? "Mude o status na tabela para somar os valores pagos."
                    : "Nenhuma tarefa encontrada."}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <AddTaskDialog
          onTaskCreated={() => {
            // Recarrega apenas o mês atual
            fetchTasksForMonth(mesAtivo, form.ano);
            updateTotalData();
          }}
        />
      </div>

      <Tabs value={mesAtivo} onValueChange={setMesAtivo}>
        <TabsList className="gap-1">
          {MESES_LISTA.map((mes) => {
            const temTarefas = tasksPorMes[mes.value]?.length > 0;

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
              {loading && mes.value === mesAtivo ? (
                <Card>
                  <CardContent>
                    <Loading />
                  </CardContent>
                </Card>
              ) : tasksPorMes[mes.value]?.length > 0 ? (
                <Card>
                  <CardContent>
                    <TasksTable
                      tasks={tasksPorMes[mes.value]}
                      total={total}
                      totalPrice={price}
                      onTasksChange={createTasksChangeHandler(mes.value)}
                    />
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent>
                    <p className="text-sm text-center text-zinc-500">
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
