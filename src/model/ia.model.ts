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
