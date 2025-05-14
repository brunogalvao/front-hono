import { useEffect, useState } from "react";
import { TasksTable } from "@/components/TasksTable";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import { Card, CardContent } from "./components/ui/card";
import Loading from "./components/Loading";

import type { Task } from "./model/tasks.model";
import { getTasks } from "./service/getTasks";

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState<number>(0);

  const fetchTasks = async () => {
    try {
      const data = await getTasks(); // <-- usando o service
      setTasks(data);
      setTotal(data.length);
    } catch (err) {
      console.error("Erro ao carregar tarefas", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="p-4 lg:max-w-2/3 md:w-max-screen mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Lista</h1>
      <div className="flex flex-row justify-between items-center">
        <div className="flex items-center text-2xl gap-3">
          Total de Tarefas
          <span className="bg-primary w-8 h-8 flex items-center justify-center rounded-full text-sm">
            {total}
          </span>
        </div>
        <AddTaskDialog onTaskCreated={fetchTasks} />
      </div>
      <Card>
        <CardContent>
          {loading ? (
            <Loading />
          ) : (
            <TasksTable tasks={tasks} onTasksChange={fetchTasks} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
