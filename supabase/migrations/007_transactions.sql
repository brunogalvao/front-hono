-- Migration 007: Transactions
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  type public.transaction_type NOT NULL,
  origin public.transaction_origin NOT NULL DEFAULT 'manual',
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  description TEXT,
  date DATE NOT NULL,
  recurring_expense_id UUID,
  installment_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_transactions_workspace_date ON public.transactions (workspace_id, date);
CREATE INDEX idx_transactions_created_by ON public.transactions (created_by);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
