import { API_BASE_URL } from '@/config/api';
import { getAuthToken } from '@/lib/supabase';

export interface EditParcelaPayload {
  title?: string;
  type?: string;
  price?: number;
}

export async function editParcela(
  parcela_group_id: string,
  payload: EditParcelaPayload,
): Promise<void> {
  const accessToken = await getAuthToken();
  const res = await fetch(`${API_BASE_URL}/api/parcelas/${parcela_group_id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erro ao editar parcela: ${errorText}`);
  }
}
