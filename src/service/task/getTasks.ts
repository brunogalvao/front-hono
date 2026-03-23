import type { Task } from '@/model/tasks.model';
import { API_BASE_URL } from '@/config/api';
import { getAuthToken } from '@/lib/supabase';

export const getTasks = async ({
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
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    console.error(`Erro: ${res.status}`);
    throw new Error('Erro ao buscar despesas');
  }

  return res.json();
};
