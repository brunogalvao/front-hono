import { useEffect, useState } from "react";
import type { Task } from "@/model/tasks.model";
import { getTasks } from "@/service/getTasks";
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

  useEffect(() => {
    getTasks()
      .then((data) => {
        console.log("🔥 Dados recebidos:", data);
        setTasks(data);
      })
      .catch((err) => console.error("Erro ao buscar tarefas:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Carregando...</p>;

  return (
    <Table>
      <TableCaption className="text-end">{tasks.length} Tarefas</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">Título</TableHead>
          <TableHead>Status</TableHead>
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
