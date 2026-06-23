export type TransactionStatus = 'pago' | 'pendente' | 'recebido';

export interface Transaction {
  id: string;
  workspace_id: string;
  category_id: string | null;
  created_by: string;
  type: 'receita' | 'despesa';
  origin: 'manual' | 'recurring' | 'installment';
  status: TransactionStatus;
  amount: number;
  description: string | null;
  date: string;
  recurring_expense_id: string | null;
  installment_id: string | null;
  created_at: string;
  categories?: { id: string; name: string; type: string; icon: string | null } | null;
  profiles?: { id: string; full_name: string | null } | null;
  installments?: { id: string; total_installments: number } | null;
  installment_number?: number;
}

export interface TransactionInput {
  workspace_id: string;
  category_id?: string | null;
  type: 'receita' | 'despesa';
  status?: TransactionStatus;
  amount: number;
  description?: string | null;
  date: string;
}
