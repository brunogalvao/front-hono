import { supabase } from '@/lib/supabase';

export const createExpenseType = async (nome: string) => {
  const session = (await supabase.auth.getSession()).data.session;
  const token = session?.access_token;

  if (!token) throw new Error('Usuário não autenticado.');

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
