import { getAuthToken } from '@/lib/supabase';
import { API_BASE_URL } from '@/config/api';
import type { CreateIncomeInput } from '@/model/incomes.model';

export async function createIncome(
  payload: CreateIncomeInput
): Promise<CreateIncomeInput> {
  const token = await getAuthToken();

  const res = await fetch(`${API_BASE_URL}/api/incomes`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
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

  try {
    return await res.json();
  } catch {
    throw new Error('Erro ao processar resposta JSON');
  }
}
