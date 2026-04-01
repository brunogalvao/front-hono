import { API_BASE_URL } from '@/config/api';
import { getAuthToken } from '@/lib/supabase';
import type { Task } from '@/model/tasks.model';

export type TasksCountByMonth = Record<number, number>;

export type TasksMonthMeta = {
  count: TasksCountByMonth;
  hasRecorrente: Record<number, boolean>;
  recorrenteNames: Record<number, string[]>;
};

export const getTasksCountByMonth = async (
  year: number
): Promise<TasksMonthMeta> => {
  const accessToken = await getAuthToken();

  const promises = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const url = new URL(`${API_BASE_URL}/api/tasks`);
    url.searchParams.append('month', String(month));
    url.searchParams.append('year', String(year));

    return fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    }).then((res) => (res.ok ? res.json() : []));
  });

  const results = await Promise.all(promises);

  const count: TasksCountByMonth = {};
  const hasRecorrente: Record<number, boolean> = {};
  const recorrenteNames: Record<number, string[]> = {};

  results.forEach((tasks: Task[], index) => {
    const month = index + 1;
    count[month] = Array.isArray(tasks) ? tasks.length : 0;

    const recorrentes = Array.isArray(tasks)
      ? tasks.filter((t) => t.recorrente === true || !!t.fixo_source_id)
      : [];

    hasRecorrente[month] = recorrentes.length > 0;
    recorrenteNames[month] = [
      ...new Set(recorrentes.map((t) => t.title)),
    ];
  });

  return { count, hasRecorrente, recorrenteNames };
};
