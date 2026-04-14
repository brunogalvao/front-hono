import { API_BASE_URL } from '@/config/api';
import { getAuthToken } from '@/lib/supabase';

export const deleteTask = async ({
  id,
  cancelAll,
}: {
  id: string;
  cancelAll?: boolean;
}) => {
  const accessToken = await getAuthToken();
  const url = cancelAll
    ? `${API_BASE_URL}/api/tasks/${id}?cancel_all=true`
    : `${API_BASE_URL}/api/tasks/${id}`;

  const res = await fetch(url, {
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
