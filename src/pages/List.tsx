import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// components
import { TasksTable } from "@/components/TasksTable";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import { Card, CardContent } from "@/components/ui/card";
import Loading from "@/components/Loading";

// model
import type { Task } from "@/model/tasks.model";

// service
import { getTasks } from "@/service/task/getTasks";
import { totalPrice, totalItems, totalPaid } from "@/service/total";
import { supabase } from "@/lib/supabase";
import TituloPage from "@/components/TituloPage";
import { BanknoteArrowUp, Loader } from "lucide-react";
import { formatToBRL } from "@/utils/format";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/animate-ui/components/tooltip";

function List() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [paid, setPaid] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      console.error(
        "Erro ao carregar tarefas:",
        err instanceof Error ? err.message : "Erro desconhecido",
      );
    } finally {
      setLoading(false);
    }
  }, []);

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
      console.error(
        "Erro ao atualizar totais:",
        err instanceof Error ? err.message : "Erro desconhecido",
      );
    }
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
      }
    };

    const setupAuthListener = () => {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!session) {
          navigate("/login");
        }
      });
      return subscription;
    };

    const fetchPrice = async () => {
      setIsLoading(true);
      try {
        const total = await totalPrice(); // sua função que busca o valor
        const paid = await totalPaid();
        setPrice(total);
        setPaid(paid);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
    fetchTasks();
    updateTotalData();
    fetchPrice();
    const subscription = setupAuthListener();

    return () => subscription.unsubscribe();
  }, [navigate, fetchTasks, updateTotalData]);

  return (
    <div className="space-y-6">
      <TituloPage titulo="Lista" />
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
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    {/* <span>Hover me</span> */}
                    <p className="p-0 text-sm text-zinc-500 cursor-pointer">
                      Sem Pagamento Efetuado
                    </p>
                  </TooltipTrigger>
                  <TooltipContent>
                    {tasks.length > 0
                      ? "Mude o status na tabela para somar os valores pagos."
                      : "Nenhuma tarefa encontrada."}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </div>

        <AddTaskDialog
          onTaskCreated={() => {
            fetchTasks();
            updateTotalData();
          }}
        />
      </div>
      {tasks && tasks.length > 0 ? (
        <Card>
          <CardContent>
            {loading ? (
              <Loading />
            ) : (
              <TasksTable
                tasks={tasks}
                total={total}
                totalPrice={price}
                onTasksChange={() => {
                  fetchTasks();
                  updateTotalData();
                }}
              />
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <p className="p-0 text-sm text-zinc-500 text-center cursor-pointer">
                    Nenhuma Tarefa Encontrada
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  Adicione uma tarefa no botão acima "Adicionar"
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default List;
