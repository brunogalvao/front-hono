import { fetchWithAuth } from '@/lib/fetch-api';

export interface EditParcelaPayload {
  title?: string;
  type?: string;
  price?: number;
}

export async function editParcela(
  parcela_group_id: string,
  payload: EditParcelaPayload,
): Promise<void> {
  await fetchWithAuth(`/api/parcelas/${parcela_group_id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}
