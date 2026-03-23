import { getAuthToken } from '@/lib/supabase';

export const createExpenseType = async (nome: string) => {
  const token = await getAuthToken();

  const response = await fetch('/api/expense-types', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ nome }),
  });

  if (!response.ok) throw new Error('Erro ao criar tipo de gasto');
  return response.json();
};
