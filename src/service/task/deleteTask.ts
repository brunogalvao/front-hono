import { API_BASE_URL } from '@/config/api';
import { getAuthToken } from '@/lib/supabase';

export const deleteTask = async (id: string) => {
  const accessToken = await getAuthToken();

  const res = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    console.error('Erro ao deletar despesa', await res.text());
    throw new Error('Erro ao deletar despesa');
  }

  return res.json();
};
