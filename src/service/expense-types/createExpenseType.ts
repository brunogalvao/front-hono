import { fetchWithAuth } from '@/lib/fetch-api';

export const createExpenseType = async (nome: string) => {
  return fetchWithAuth('/api/expense-types', {
    method: 'POST',
    body: JSON.stringify({ nome }),
  });
};
