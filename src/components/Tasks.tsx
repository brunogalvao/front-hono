import { useEffect, useState } from "react";
import type { Task } from "@/model/tasks.model";
import { getTasks } from "@/service/task/getTasks";
// ui
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const now = new Date();
    const month = now.getMonth() + 1; // getMonth() retorna 0-11
    const year = now.getFullYear();

    getTasks({ month, year })
      .then((data) => {
        setTasks(data);
        setError(null);
      })
      .catch((err) => {
        console.error("Erro ao buscar tarefas:", err);
        setError("Erro ao buscar tarefas.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Carregando...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <Table>
      <TableCaption className="text-end">{tasks.length} Tarefas</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]" scope="col">
            Título
          </TableHead>
          <TableHead scope="col">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TableRow key={task.id}>
            <TableCell className="font-medium">{task.title}</TableCell>
            <TableCell>
              <span className={task.done ? "text-green-500" : "text-red-500"}>
                {task.done ? "Concluída" : "Pendente"}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default Tasks;
