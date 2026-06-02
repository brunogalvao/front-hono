import { fetchWithAuth } from '@/lib/fetch-api';
import type { NewTask } from '@/model/tasks.model';

export async function createTask(task: NewTask): Promise<NewTask> {
  return fetchWithAuth<NewTask>('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(task),
  });
}
