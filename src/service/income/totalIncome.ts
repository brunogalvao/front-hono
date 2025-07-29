import { supabase } from '@/lib/supabase';
import { API_BASE_URL } from '@/config/api';

export const totalIncomes = async (): Promise<number> => {
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;

  if (!token) throw new Error('Usuário não autenticado.');

  const res = await fetch(`${API_BASE_URL}/api/incomes/total-incomes`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    console.error(`Erro: ${res.status}`);
    throw new Error('Erro ao buscar total de rendimentos');
  }

  const data = await res.json();
  return data.total_incomes;
};
