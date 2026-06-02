import { fetchWithAuth } from '@/lib/fetch-api';
import type { IncomeItem } from '@/model/incomes.model';

export async function editIncome(
  income: Partial<IncomeItem> & { id: string }
): Promise<IncomeItem> {
  return fetchWithAuth<IncomeItem>('/api/incomes', {
    method: 'PATCH',
    body: JSON.stringify(income),
  });
}
