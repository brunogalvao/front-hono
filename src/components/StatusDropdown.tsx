import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { editTask } from "@/service/task/editTask";
import { TaskStatus, type Task } from "@/model/tasks.model";
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
      const novoStatus =
        task.done === TaskStatus.Completed
          ? TaskStatus.Pending
          : TaskStatus.Completed;

      await editTask(task.id, { done: novoStatus });

      onStatusChanged();
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="cursor-pointer" asChild>
        <Badge variant={task.done ? "default" : "destructive"}>
          {task.done ? TaskStatus.Completed : TaskStatus.Pending}
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={toggleStatus}>
          {task.done ? TaskStatus.Pending : TaskStatus.Completed}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
export default StatusDropdown;
