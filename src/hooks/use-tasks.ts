import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTasks } from '@/service/task/getTasks';
import { createTask } from '@/service/task/createTask';
import { editTask } from '@/service/task/editTask';
import { deleteTask } from '@/service/task/deleteTask';
import { queryKeys } from '@/lib/query-keys';
import type { Task } from '@/model/tasks.model';

// Hook para buscar tarefas
export function useTasks(month: number, year: number) {
  return useQuery({
    queryKey: queryKeys.tasks.list({ month, year }),
    queryFn: () => getTasks({ month, year }),
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

// Hook para criar tarefa
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: (newTask, variables) => {
      // Invalida queries relacionadas
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() });

      // Atualiza cache otimisticamente
      const month = variables.mes;
      const year = variables.ano;
      queryClient.setQueryData(
        queryKeys.tasks.list({ month, year }),
        (oldData: Task[] | undefined) => {
          if (!oldData) return [newTask];
          return [...oldData, newTask];
        }
      );
    },
  });
}

// Hook para editar tarefa
export function useEditTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => editTask(id, data),
    onSuccess: (updatedTask, variables) => {
      // Invalida queries relacionadas
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() });

      // Atualiza cache otimisticamente
      const month = variables.data.mes;
      const year = variables.data.ano;
      queryClient.setQueryData(
        queryKeys.tasks.list({ month, year }),
        (oldData: Task[] | undefined) => {
          if (!oldData) return [updatedTask];
          return oldData.map((task) =>
            task.id === variables.id ? updatedTask : task
          );
        }
      );
    },
  });
}

// Hook para deletar tarefa
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      // Invalida todas as queries de tarefas
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() });
    },
  });
}
