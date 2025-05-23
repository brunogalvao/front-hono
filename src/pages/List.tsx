import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
// components
import { TasksTable } from "@/components/TasksTable";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import { Card, CardContent } from "@/components/ui/card";
import Loading from "@/components/Loading";

// model
import type { Task } from "@/model/tasks.model";

// service
import { getTasks } from "@/service/getTasks";
import { totalPrice, totalItems } from "@/service/total";
import { formatToBRL } from "@/utils/format";
// import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import TituloPage from "@/components/TituloPage";

function List() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);

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
      const [totalResult, priceResult] = await Promise.all([
        totalItems(),
        totalPrice(),
      ]);
      setTotal(totalResult);
      setPrice(priceResult);
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

    checkUser();
    fetchTasks();
    updateTotalData();
    const subscription = setupAuthListener();

    return () => subscription.unsubscribe();
  }, [navigate, fetchTasks, updateTotalData]);

  return (
    <div className="space-y-6">
      <TituloPage titulo="Lista" />

      <div className="flex flex-row justify-between items-center">
        <div className="flex items-center text-2xl gap-3">
          Total
          <span className="bg-primary w-auto h-8 px-3 flex items-center justify-center rounded-full text-sm">
            {price > 0 ? formatToBRL(price) : "Carregando ..."}
          </span>
        </div>
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
