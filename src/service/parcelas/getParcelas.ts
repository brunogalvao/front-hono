import { fetchWithAuth } from '@/lib/fetch-api';
import type { ParcelaGroup } from '@/model/parcelas.model';

export async function getParcelas(): Promise<ParcelaGroup[]> {
  return fetchWithAuth<ParcelaGroup[]>('/api/parcelas');
}
