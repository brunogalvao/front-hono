import { API_BASE_URL } from '@/config/api';
import { getAuthToken } from '@/lib/supabase';

export async function deleteParcela(parcela_group_id: string): Promise<void> {
  const accessToken = await getAuthToken();
  const res = await fetch(`${API_BASE_URL}/api/parcelas/${parcela_group_id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erro ao deletar parcela: ${errorText}`);
  }
}
