import { getAuthToken } from '@/lib/supabase';
import { API_BASE_URL } from '@/config/api';

export async function deleteIncome(id: string): Promise<void> {
  const token = await getAuthToken();

  const res = await fetch(`${API_BASE_URL}/api/incomes/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    let msg = 'Erro desconhecido';
    try {
      const data = await res.json();
      msg = data?.error || msg;
    } catch {
      msg = `Erro HTTP ${res.status}`;
    }
    throw new Error(msg);
  }

  return;
}
