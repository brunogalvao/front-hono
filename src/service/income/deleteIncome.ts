import { fetchWithAuth } from '@/lib/fetch-api';

export async function deleteIncome(id: string): Promise<void> {
  await fetchWithAuth(`/api/incomes/${id}`, { method: 'DELETE' });
}
