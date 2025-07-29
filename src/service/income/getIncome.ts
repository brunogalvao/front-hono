import { supabase } from '@/lib/supabase';
import type { IncomeItem } from '@/model/incomes.model';
import { API_BASE_URL } from '@/config/api';

export async function getIncomes(): Promise<IncomeItem[]> {
  const session = (await supabase.auth.getSession()).data.session;
  const token = session?.access_token;

  if (!token) throw new Error('Usuário não autenticado');

  const res = await fetch(`${API_BASE_URL}/api/incomes`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    let msg = 'Erro desconhecido';
    try {
      const data = await res.json();
      msg = data?.error || msg;
    } catch {
      msg = `Erro HTTP ${res.status}`;
    }
    throw new Error(msg);
  }

  const data = await res.json();

  // ✅ Garante que o retorno seja um array
  if (!Array.isArray(data)) {
    throw new Error('Resposta da API não é uma lista');
  }

  return data as IncomeItem[];
}
