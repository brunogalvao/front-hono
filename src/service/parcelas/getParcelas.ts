import { API_BASE_URL } from '@/config/api';
import { getAuthToken } from '@/lib/supabase';
import type { ParcelaGroup } from '@/model/parcelas.model';

export async function getParcelas(): Promise<ParcelaGroup[]> {
  const accessToken = await getAuthToken();
  const res = await fetch(`${API_BASE_URL}/api/parcelas`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Erro ao buscar compras parceladas');
  return res.json();
}
