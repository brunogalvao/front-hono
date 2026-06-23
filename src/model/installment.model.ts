export interface Installment {
  id: string;
  workspace_id: string;
  category_id: string | null;
  created_by: string;
  description: string;
  total_amount: number;
  installment_amount: number;
  remainder_amount: number;
  total_installments: number;
  paid_installments: number;
  first_installment_date: string;
  status: 'active' | 'completed' | 'cancelled';
  last_generated_date: string | null;
  created_at: string;
  categories?: { id: string; name: string } | null;
}

export interface InstallmentInput {
  workspace_id: string;
  description: string;
  total_amount: number;
  total_installments: number;
  first_installment_date: string;
  category_id?: string | null;
}

export interface InstallmentUpdateInput {
  description?: string;
  category_id?: string | null;
  installment_amount?: number;
  total_installments?: number;
  status?: 'active' | 'completed' | 'cancelled';
}
