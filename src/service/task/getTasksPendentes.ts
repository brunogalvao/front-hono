import { fetchWithAuth } from '@/lib/fetch-api';
import type { Task } from '@/model/tasks.model';

export const getTasksPendentes = async ({
  month,
  year,
}: {
  month: number;
  year: number;
}): Promise<Task[]> => {
  const tasks = await fetchWithAuth<Task[]>(`/api/tasks?month=${month}&year=${year}`);
  return tasks.filter((t) => t.done === 'Pendente');
};
