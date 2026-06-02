import { fetchWithAuth } from '@/lib/fetch-api';
import type { CreateIncomeInput } from '@/model/incomes.model';

export async function createIncome(
  payload: CreateIncomeInput
): Promise<CreateIncomeInput> {
  return fetchWithAuth<CreateIncomeInput>('/api/incomes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
