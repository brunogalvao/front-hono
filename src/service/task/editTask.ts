import { fetchWithAuth } from '@/lib/fetch-api';
import type { Task } from '@/model/tasks.model';

export const editTask = async (id: string, updated: Partial<Task>) => {
  return fetchWithAuth<Task>(`/api/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updated),
  });
};
