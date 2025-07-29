import type { IncomeItem } from '@/model/incomes.model';

export type CardIncomeProps = {
  incomes: IncomeItem[];
  loading: boolean;
  total: number;
  setForm: (form: {
    descricao: string;
    valor: number;
    mes: number;
    ano: number;
  }) => void;
  setEditingId: (id: string) => void;
  handleDelete: (id: string) => void;
};
