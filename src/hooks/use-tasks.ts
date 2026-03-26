import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTasks } from '@/service/task/getTasks';
import { createTask } from '@/service/task/createTask';
import { editTask } from '@/service/task/editTask';
import { deleteTask } from '@/service/task/deleteTask';
import { queryKeys } from '@/lib/query-keys';
import type { Task } from '@/model/tasks.model';

// Hook para buscar despesas
export function useTasks(month: number, year: number) {
  return useQuery({
    queryKey: queryKeys.tasks.list({ month, year }),
    queryFn: () => getTasks({ month, year }),
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

// Hook para criar despesa
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: (newTask, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.totals.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.ia.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });

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

// Hook para editar despesa
export function useEditTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) =>
      editTask(id, data),
    onSuccess: (updatedTask, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.totals.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.ia.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });

      const month = variables.data.mes || updatedTask.mes;
      const year = variables.data.ano || updatedTask.ano;

      if (month && year) {
        queryClient.setQueryData(
          queryKeys.tasks.list({ month, year }),
          (oldData: Task[] | undefined) => {
            if (!oldData) return [updatedTask];
            return oldData.map((task) =>
              task.id === variables.id ? updatedTask : task
            );
          }
        );
      }
    },
  });
}

// Hook para deletar despesa
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.totals.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.ia.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}
