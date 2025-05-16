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
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

function Admin() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [total, setTotal] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error instanceof Error ? error.message : "Erro desconhecido");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const fetchTasks = useCallback(async () => {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      console.error("Erro ao carregar tarefas:", err instanceof Error ? err.message : "Erro desconhecido");
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
      console.error("Erro ao atualizar totais:", err instanceof Error ? err.message : "Erro desconhecido");
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
    <div className="p-4 lg:max-w-2/3 md:w-max-screen mx-auto space-y-6 relative">
      <div className="flex flex-row justify-between">
        <h1 className="text-2xl font-bold">Lista</h1>
        <Button
          className="cursor-pointer"
          variant="outline"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? "Saindo..." : "Sair"}
        </Button>
      </div>
      <motion.div
        className="h-1"
        style={{
          background: "linear-gradient(to right, #a855f7, #ec4899, #ef4444)",
          backgroundSize: "200% 100%",
        }}
        animate={{
          backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
      />

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

export default Admin;
