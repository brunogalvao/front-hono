import { API_BASE_URL } from '@/config/api';
import { supabase } from '@/lib/supabase';

export type TasksCountByMonth = Record<number, number>;

export const getTasksCountByMonth = async (
  year: number
): Promise<TasksCountByMonth> => {
  const session = await supabase.auth.getSession();
  const accessToken = session.data.session?.access_token;

  if (!accessToken) {
    throw new Error('Usuário não autenticado.');
  }

  // Busca tasks de todos os meses do ano em paralelo
  const promises = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const url = new URL(`${API_BASE_URL}/api/tasks`);
    url.searchParams.append('month', String(month));
    url.searchParams.append('year', String(year));

    return fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }).then((res) => (res.ok ? res.json() : []));
  });

  const results = await Promise.all(promises);

  // Retorna objeto com contagem por mês
  const countByMonth: TasksCountByMonth = {};
  results.forEach((tasks, index) => {
    const month = index + 1;
    countByMonth[month] = Array.isArray(tasks) ? tasks.length : 0;
  });

  return countByMonth;
};
