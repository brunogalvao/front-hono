import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { editTask } from "@/service/task/editTask";
import {
  TASK_STATUS_LIST,
  type TaskStatus,
  type Task,
  TASK_STATUS,
} from "@/model/tasks.model";
import { Badge } from "@/components/ui/badge";

function StatusDropdown({
  task,
  onStatusChanged,
}: {
  task: Task;
  onStatusChanged: () => void;
}) {
  const handleChangeStatus = async (newStatus: TaskStatus) => {
    try {
      await editTask(task.id, { done: newStatus });
      onStatusChanged();
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Badge
          variant={task.done === TASK_STATUS.Pago ? "outline" : "default"}
          className="cursor-pointer"
        >
          {task.done}
        </Badge>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        {TASK_STATUS_LIST.map((status) => (
          <DropdownMenuItem
            key={status.value}
            onClick={() => handleChangeStatus(status.value as TaskStatus)}
          >
            {status.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default StatusDropdown;
