import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { editTask } from "@/service/task/editTask";
import type { Task } from "@/model/tasks.model";
import { Badge } from "@/components/ui/badge";

function StatusDropdown({
  task,
  onStatusChanged,
}: {
  task: Task;
  onStatusChanged: () => void;
}) {
  const toggleStatus = async () => {
    try {
      await editTask(task.id, { done: !task.done });
      onStatusChanged(); // recarrega os dados
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="cursor-pointer" asChild>
        <Badge variant={task.done ? "default" : "destructive"}>
          {task.done ? "Concluído" : "Pendente"}
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={toggleStatus}>
          {task.done ? "Marcar como Pendente" : "Marcar como Concluído"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
export default StatusDropdown;
