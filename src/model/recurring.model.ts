export interface RecurringExpense {
  id: string;
  workspace_id: string;
  category_id: string | null;
  created_by: string;
  description: string;
  amount: number;
  frequency: 'monthly' | 'weekly' | 'yearly';
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  last_generated_date: string | null;
  created_at: string;
  categories?: { id: string; name: string; icon: string | null } | null;
}

export interface RecurringInput {
  workspace_id: string;
  description: string;
  amount: number;
  frequency: 'monthly' | 'weekly' | 'yearly';
  start_date: string;
  end_date?: string | null;
  category_id?: string | null;
}
