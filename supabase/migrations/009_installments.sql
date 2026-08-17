-- Migration 009: Installments
CREATE TABLE public.installments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  description TEXT NOT NULL,
  total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount > 0),
  installment_amount NUMERIC(12, 2) NOT NULL CHECK (installment_amount > 0),
  remainder_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_installments INTEGER NOT NULL CHECK (total_installments > 1),
  paid_installments INTEGER NOT NULL DEFAULT 0,
  first_installment_date DATE NOT NULL,
  status public.installment_status NOT NULL DEFAULT 'active',
  last_generated_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FK from transactions back to installments
ALTER TABLE public.transactions
  ADD CONSTRAINT fk_transactions_installment
  FOREIGN KEY (installment_id)
  REFERENCES public.installments(id)
  ON DELETE SET NULL;

ALTER TABLE public.installments ENABLE ROW LEVEL SECURITY;
