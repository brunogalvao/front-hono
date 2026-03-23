import { API_BASE_URL } from '@/config/api';
import type { NewTask } from '@/model/tasks.model';
import { getAuthToken } from '@/lib/supabase';

export async function createTask(task: NewTask): Promise<NewTask> {
  const accessToken = await getAuthToken();

  const res = await fetch(`${API_BASE_URL}/api/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(task),
  });

  if (!res.ok) {
    console.error('Erro ao criar despesa', await res.text());
    throw new Error('Erro ao criar despesa');
  }

  return res.json();
}
