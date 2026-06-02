import { fetchWithAuth } from '@/lib/fetch-api';

export async function deleteParcela(parcela_group_id: string): Promise<void> {
  await fetchWithAuth(`/api/parcelas/${parcela_group_id}`, { method: 'DELETE' });
}
