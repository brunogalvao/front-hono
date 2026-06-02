import { fetchWithAuth } from '@/lib/fetch-api';

export const totalIncomes = async (): Promise<number> => {
  const data = await fetchWithAuth<{ total_incomes: number }>('/api/incomes/total-incomes');
  return data.total_incomes;
};
