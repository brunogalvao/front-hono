import { getAuthToken } from '@/lib/supabase';
import { API_BASE_URL } from '@/config/api';

export interface IASimplificada {
  despesasPagas: number;
  despesasPendentes: number;
  totalDespesas: number;
  rendimentoMes: number;
  percentualDisponivel: number;
  percentualGasto: number;
  dicasEconomia: string[];
  resultadoLiquido: number;
  cotacaoDolar: number;
  quantidadeDolar: number;
}

export interface IAResponse {
  success: boolean;
  data: IASimplificada;
}

function gerarDicasEconomia(percentualGasto: number): string[] {
  if (percentualGasto < 50) {
    return [
      'Excelente controle financeiro! Continue assim.',
      'Considere aumentar seus investimentos.',
      'Mantenha uma reserva de emergência.',
    ];
  } else if (percentualGasto < 70) {
    return [
      'Bom controle financeiro, mas há espaço para melhorar.',
      'Revise gastos desnecessários.',
      'Estabeleça metas de economia mensais.',
    ];
  } else if (percentualGasto < 90) {
    return [
      'Atenção: você está gastando muito da sua renda.',
      'Corte gastos supérfluos urgentemente.',
      'Crie um orçamento detalhado.',
    ];
  } else {
    return [
      'ALERTA: situação financeira crítica!',
      'Corte todos os gastos não essenciais.',
      'Busque fontes de renda extra.',
      'Considere renegociar dívidas.',
    ];
  }
}

export async function getIA(): Promise<IAResponse> {
  const token = await getAuthToken();

  const mesAtual = new Date().getMonth() + 1;
  const anoAtual = new Date().getFullYear();

  const response = await fetch(`${API_BASE_URL}/api/ia/analise-investimento`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mes: mesAtual, ano: anoAtual }),
  });

  if (!response.ok) {
    throw new Error(`Falha na análise financeira: ${response.status}`);
  }

  const raw = await response.json();

  return {
    success: true,
    data: {
      despesasPagas: raw.tarefasPagas ?? 0,
      despesasPendentes: raw.tarefasPendentes ?? 0,
      totalDespesas: raw.totalTarefas ?? 0,
      rendimentoMes: raw.rendimentoMes ?? 0,
      percentualDisponivel: Math.round(raw.percentualDisponivel ?? 0),
      percentualGasto: Math.round(raw.percentualGasto ?? 0),
      dicasEconomia: gerarDicasEconomia(raw.percentualGasto ?? 0),
      resultadoLiquido: raw.resultadoLiquido ?? 0,
      cotacaoDolar: raw.cotacaoDolar > 0 ? raw.cotacaoDolar : 5.25,
      quantidadeDolar: raw.quantidadeDolar ?? 0,
    },
  };
}
