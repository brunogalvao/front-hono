import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { editTask } from '@/service/task/editTask';
import {
  TASK_STATUS_LIST,
  type TaskStatus,
  type Task,
  TASK_STATUS,
} from '@/model/tasks.model';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Loader } from 'lucide-react';
import { toast } from 'sonner';

function StatusDropdown({
  task,
  onStatusChanged,
}: {
  task: Task;
  onStatusChanged: () => void;
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [localStatus, setLocalStatus] = useState<TaskStatus>(task.done);

  const handleChangeStatus = async (newStatus: TaskStatus) => {
    // Evita atualização se o status for o mesmo
    if (localStatus === newStatus) {
      console.log('Status já é o mesmo, ignorando...');
      return;
    }

    setIsUpdating(true);
    console.log(
      `🔄 Atualizando status da tarefa ${task.id} de "${localStatus}" para "${newStatus}"`
    );
    console.log('📤 Dados sendo enviados:', { id: task.id, done: newStatus });

    try {
      // Atualiza o estado local imediatamente para feedback visual
      setLocalStatus(newStatus);

      const updatedTask = await editTask(task.id, { done: newStatus });
      console.log('✅ Status atualizado com sucesso:', updatedTask);

      // Feedback para o usuário
      toast.success(`Status alterado para ${newStatus}`);

      // Chama a função de callback para atualizar a tabela
      console.log('🔄 Chamando onStatusChanged...');
      onStatusChanged();

      console.log('📊 Tabela atualizada');
    } catch (err) {
      console.error('❌ Erro ao atualizar status:', err);
      // Reverte o estado local em caso de erro
      setLocalStatus(task.done);
      toast.error('Erro ao atualizar status da tarefa');
    } finally {
      setIsUpdating(false);
    }
  };

  // Atualiza o status local quando a task muda
  if (task.done !== localStatus && !isUpdating) {
    setLocalStatus(task.done);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Badge
          variant={localStatus === TASK_STATUS.Pago ? 'outline' : 'default'}
          className="flex cursor-pointer items-center gap-1"
        >
          {isUpdating ? <Loader className="h-3 w-3 animate-spin" /> : null}
          {localStatus}
        </Badge>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        {TASK_STATUS_LIST.map((status) => (
          <DropdownMenuItem
            key={status.value}
            onClick={() => handleChangeStatus(status.value as TaskStatus)}
            disabled={isUpdating}
          >
            {status.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default StatusDropdown;
