import { API_BASE_URL } from '@/config/api';
import { getAuthToken } from '@/lib/supabase';
import type { Task } from '@/model/tasks.model';

export const getTasksPendentes = async ({
  month,
  year,
}: {
  month: number;
  year: number;
}): Promise<Task[]> => {
  const accessToken = await getAuthToken();

  const url = new URL(`${API_BASE_URL}/api/tasks`);
  url.searchParams.append('month', String(month));
  url.searchParams.append('year', String(year));

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error('Erro ao buscar despesas');

  const tasks: Task[] = await res.json();
  return tasks.filter((t) => t.done === 'Pendente');
};
