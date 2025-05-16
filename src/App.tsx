import { useEffect, useState } from "react";
import { TasksTable } from "@/components/TasksTable";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import { Card, CardContent } from "./components/ui/card";
import Loading from "./components/Loading";

import type { Task } from "./model/tasks.model";

import { getTasks } from "./service/getTasks";
import { totalPrice, totalItems } from "./service/total";
import { formatToBRL } from "./utils/format";

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [total, setTotal] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);

  const fetchTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      console.error("Erro ao carregar tarefas", err);
    } finally {
      setLoading(false);
    }
  };

  const updateTotalData = async () => {
    try {
      const [totalResult, priceResult] = await Promise.all([
        totalItems(),
        totalPrice(),
      ]);
      setTotal(totalResult);
      setPrice(priceResult);
    } catch (err) {
      console.error("Erro ao atualizar totais:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
    updateTotalData();
  }, []);

  return (
    <div className="p-4 lg:max-w-2/3 md:w-max-screen mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Lista</h1>
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

export default App;
