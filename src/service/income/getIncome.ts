import { fetchWithAuth } from '@/lib/fetch-api';
import type { IncomeItem } from '@/model/incomes.model';

export async function getIncomes(): Promise<IncomeItem[]> {
  const data = await fetchWithAuth<IncomeItem[]>('/api/incomes');
  if (!Array.isArray(data)) throw new Error('Resposta da API não é uma lista');
  return data;
}
