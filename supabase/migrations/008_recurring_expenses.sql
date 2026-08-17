-- Migration 008: Recurring Expenses
CREATE TABLE public.recurring_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  description TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  frequency public.frequency_type NOT NULL DEFAULT 'monthly',
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_generated_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FK from transactions back to recurring_expenses
ALTER TABLE public.transactions
  ADD CONSTRAINT fk_transactions_recurring
  FOREIGN KEY (recurring_expense_id)
  REFERENCES public.recurring_expenses(id)
  ON DELETE SET NULL;

ALTER TABLE public.recurring_expenses ENABLE ROW LEVEL SECURITY;
