import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
// components
import { TasksTable } from "@/components/TasksTable";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import { Card, CardContent } from "@/components/ui/card";
import Loading from "@/components/Loading";
// import { FaCreativeCommonsZero } from "react-icons/fa";

// model
import type { Task } from "@/model/tasks.model";

// service
import { getTasks } from "@/service/task/getTasks";
import { totalPrice, totalItems, totalPaid } from "@/service/total";
import { supabase } from "@/lib/supabase";
import TituloPage from "@/components/TituloPage";
import { BanknoteArrowUp, Loader } from "lucide-react";
import { formatToBRL } from "@/utils/format";
// import { px } from "motion/react";

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
        err instanceof Error ? err.message : "Erro desconhecido"
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
        err instanceof Error ? err.message : "Erro desconhecido"
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
            <p className="p-0 text-sm text-zinc-500">Sem Pagamento Efetuado</p>
          )}
        </div>

        {/* <div className="flex items-center text-2xl gap-3"> */}
        {/* Total */}
        {/* <span className="bg-primary py-2 px-6 text-xl font-semibold flex items-center justify-center rounded-full">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader className="h-4 w-4 animate-spin" />
                Carregando...
              </span>
            ) : price > 0 ? (
              formatToBRL(price)
            ) : (
              <FaCreativeCommonsZero />
            )}
          </span> */}
        {/* </div> */}
        <AddTaskDialog
          onTaskCreated={() => {
            fetchTasks();
            updateTotalData();
          }}
        />
      </div>
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
    </div>
  );
}

export default List;
