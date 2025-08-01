import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
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
import { useEditTask } from '@/hooks/use-tasks';

function StatusDropdown({
  task,
  onStatusChanged,
}: {
  task: Task;
  onStatusChanged: () => void;
}) {
  const [localStatus, setLocalStatus] = useState<boolean>(task.done);

  // Hook para edição com invalidação automática do cache
  const editTaskMutation = useEditTask();

  const handleChangeStatus = async (newStatusString: TaskStatus) => {
    const newStatusBoolean = newStatusString === TASK_STATUS.Pago;

    // Evita atualização se o status for o mesmo
    if (localStatus === newStatusBoolean) {
      console.log('Status já é o mesmo, ignorando...');
      return;
    }

    console.log(
      `🔄 Atualizando status da tarefa ${task.id} de "${localStatus ? TASK_STATUS.Pago : TASK_STATUS.Pendente}" para "${newStatusString}"`
    );
    console.log('📤 Dados sendo enviados:', {
      id: task.id,
      done: newStatusBoolean,
    });

    try {
      // Atualiza o estado local imediatamente para feedback visual
      setLocalStatus(newStatusBoolean);

      await editTaskMutation.mutateAsync({
        id: task.id,
        data: { done: newStatusBoolean },
      });
      console.log('✅ Status atualizado com sucesso');

      // Feedback para o usuário
      toast.success(`Status alterado para ${newStatusString}`);

      // Chama a função de callback para atualizar a tabela
      console.log('🔄 Chamando onStatusChanged...');
      onStatusChanged();

      console.log('📊 Tabela atualizada');
    } catch (err) {
      console.error('❌ Erro ao atualizar status:', err);
      // Reverte o estado local em caso de erro
      setLocalStatus(task.done);
      toast.error('Erro ao atualizar status da tarefa');
    }
  };

  // Atualiza o status local quando a task muda
  if (task.done !== localStatus && !editTaskMutation.isPending) {
    setLocalStatus(task.done);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Badge
          variant={localStatus ? 'outline' : 'default'}
          className="flex cursor-pointer items-center gap-1"
        >
          {editTaskMutation.isPending ? (
            <Loader className="h-3 w-3 animate-spin" />
          ) : null}
          {localStatus ? TASK_STATUS.Pago : TASK_STATUS.Pendente}
        </Badge>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        {TASK_STATUS_LIST.map((status) => (
          <DropdownMenuItem
            key={status.value}
            onClick={() => handleChangeStatus(status.value as TaskStatus)}
            disabled={editTaskMutation.isPending}
          >
            {status.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default StatusDropdown;
