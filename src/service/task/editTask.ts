import { API_BASE_URL } from '@/config/api';
import type { Task } from '@/model/tasks.model';
import { getAuthToken } from '@/lib/supabase';

export const editTask = async (id: string, updated: Partial<Task>) => {
  const accessToken = await getAuthToken();

  const res = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(updated),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ Erro ao editar despesa:', errorText);
    throw new Error(`Erro ao editar despesa: ${errorText}`);
  }

  const result = await res.json();
  return result;
};
