import { supabase } from '@/lib/supabase';
import { API_BASE_URL } from '@/config/api';
import { getIncomes } from './getIncome';

export interface IncomeByMonth {
  mes: number;
  total: number;
}

export async function getIncomesByMonth(): Promise<Record<number, number>> {
  const session = (await supabase.auth.getSession()).data.session;
  const token = session?.access_token;

  if (!token) throw new Error('Usuário não autenticado');

  try {
    // Tenta usar a API primeiro - busca todos os incomes e agrupa no frontend
    const incomes = await getIncomes();

    // Agrupa por mês
    const agrupadoPorMes = incomes.reduce(
      (acc, curr) => {
        const mes = Number(curr.mes);
        const valor = Number(curr.valor ?? 0);
        acc[mes] = (acc[mes] || 0) + valor;
        return acc;
      },
      {} as Record<number, number>
    );

    return agrupadoPorMes;
  } catch (error) {
    console.warn('API falhou, usando fallback Supabase:', error);
  }

  // Fallback: usa Supabase diretamente
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error('Usuário não autenticado');

  const uid = userData.user.id;

  const { data: rendimentos, error } = await supabase
    .from('incomes')
    .select('mes, valor')
    .eq('user_id', uid);

  if (error) {
    console.error('Erro ao carregar salários:', error);
    throw new Error('Erro ao carregar dados');
  }

  const agrupadoPorMes = rendimentos.reduce(
    (acc, curr) => {
      const mes = Number(curr.mes);
      const valor = Number(curr.valor ?? 0);
      acc[mes] = (acc[mes] || 0) + valor;
      return acc;
    },
    {} as Record<number, number>
  );

  return agrupadoPorMes;
}
