export type ParcelaGroup = {
  parcela_group_id: string;
  title: string;
  valor_total: number;
  parcela_total: number;
  parcelas_pagas: number;
  valor_parcela: number;
  status: 'Ativo' | 'Quitada';
  mes_inicio: number;
  ano_inicio: number;
  type?: string;
};
