import { fetchWithAuth } from '@/lib/fetch-api';
import type { Task } from '@/model/tasks.model';

export const getTasks = async ({
  month,
  year,
}: {
  month: number;
  year: number;
}): Promise<Task[]> => {
  return fetchWithAuth<Task[]>(`/api/tasks?month=${month}&year=${year}`);
};
