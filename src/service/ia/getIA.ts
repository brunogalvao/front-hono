import { fetchWithAuth } from '@/lib/fetch-api';
import type { IASimplificada, IAResponse } from '@/model/ia.model';

export type { IASimplificada, IAResponse };

export async function getIA(): Promise<IAResponse> {
  const mesAtual = new Date().getMonth() + 1;
  const anoAtual = new Date().getFullYear();

  const raw = await fetchWithAuth<Record<string, number>>(
    '/api/ia/analise-investimento',
    {
      method: 'POST',
      body: JSON.stringify({ mes: mesAtual, ano: anoAtual }),
    }
  );

  return {
    success: true,
    data: {
      despesasPagas: raw.tarefasPagas ?? 0,
      despesasPendentes: raw.tarefasPendentes ?? 0,
      totalDespesas: raw.totalTarefas ?? 0,
      rendimentoMes: raw.rendimentoMes ?? 0,
      percentualDisponivel: Math.round(raw.percentualDisponivel ?? 0),
      percentualGasto: Math.round(raw.percentualGasto ?? 0),
      resultadoLiquido: raw.resultadoLiquido ?? 0,
      valorLivre: raw.valorLivre ?? 0,
      cotacaoDolar: raw.cotacaoDolar > 0 ? raw.cotacaoDolar : 5.25,
      quantidadeDolar: raw.quantidadeDolar ?? 0,
    },
  };
}
