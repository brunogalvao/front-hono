import type { Task } from '@/model/tasks.model';
import { API_BASE_URL } from '@/config/api';
import { getAuthToken } from '@/lib/supabase';

export type TasksByYear = Record<number, Task[]>;

export const getTasksByYear = async (year: number): Promise<TasksByYear> => {
  const accessToken = await getAuthToken();

  const promises = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const url = new URL(`${API_BASE_URL}/api/tasks`);
    url.searchParams.append('month', String(month));
    url.searchParams.append('year', String(year));

    return fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }).then((res) => (res.ok ? (res.json() as Promise<Task[]>) : []));
  });

  const results = await Promise.all(promises);

  const tasksByMonth: TasksByYear = {};
  results.forEach((tasks, index) => {
    const month = index + 1;
    tasksByMonth[month] = Array.isArray(tasks) ? tasks : [];
  });

  return tasksByMonth;
};
