export interface IncomeItem {
  id: string;
  descricao?: string;
  valor: number;
  mes: number;
  ano: number;
}

export interface CreateIncomeInput {
  descricao?: string;
  valor: number;
  mes: number;
  ano: number;
}
