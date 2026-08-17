-- Migration 013: Processing Functions for recurring expenses and installments

-- Generate transactions for active recurring expenses
CREATE OR REPLACE FUNCTION public.generate_recurring_transactions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  rec RECORD;
  next_date DATE;
  today DATE := CURRENT_DATE;
BEGIN
  FOR rec IN
    SELECT * FROM public.recurring_expenses
    WHERE is_active = true
      AND (end_date IS NULL OR end_date >= today)
  LOOP
    next_date := COALESCE(rec.last_generated_date, rec.start_date - INTERVAL '1 month')::DATE;

    LOOP
      CASE rec.frequency
        WHEN 'monthly' THEN next_date := next_date + INTERVAL '1 month';
        WHEN 'weekly'  THEN next_date := next_date + INTERVAL '1 week';
        WHEN 'yearly'  THEN next_date := next_date + INTERVAL '1 year';
      END CASE;

      EXIT WHEN next_date > today;
      EXIT WHEN rec.end_date IS NOT NULL AND next_date > rec.end_date;

      INSERT INTO public.transactions (
        workspace_id, category_id, created_by, type, origin,
        amount, description, date, recurring_expense_id
      ) VALUES (
        rec.workspace_id, rec.category_id, rec.created_by,
        'despesa', 'recurring',
        rec.amount, rec.description, next_date, rec.id
      )
      ON CONFLICT DO NOTHING;

      UPDATE public.recurring_expenses
        SET last_generated_date = next_date, updated_at = now()
        WHERE id = rec.id;
    END LOOP;
  END LOOP;
END;
$$;

-- Generate monthly installment transactions
CREATE OR REPLACE FUNCTION public.generate_installment_transactions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  inst RECORD;
  next_date DATE;
  today DATE := CURRENT_DATE;
  remaining INTEGER;
BEGIN
  FOR inst IN
    SELECT * FROM public.installments
    WHERE status = 'active'
  LOOP
    remaining := inst.total_installments - inst.paid_installments;
    EXIT WHEN remaining <= 0;

    next_date := COALESCE(inst.last_generated_date, inst.first_installment_date - INTERVAL '1 month')::DATE;

    LOOP
      next_date := next_date + INTERVAL '1 month';
      EXIT WHEN next_date > today;
      EXIT WHEN inst.paid_installments >= inst.total_installments;

      INSERT INTO public.transactions (
        workspace_id, category_id, created_by, type, origin,
        amount, description, date, installment_id
      ) VALUES (
        inst.workspace_id, inst.category_id, inst.created_by,
        'despesa', 'installment',
        inst.installment_amount,
        inst.description || ' (' || (inst.paid_installments + 1)::text || '/' || inst.total_installments::text || ')',
        next_date, inst.id
      )
      ON CONFLICT DO NOTHING;

      UPDATE public.installments
        SET
          paid_installments = paid_installments + 1,
          last_generated_date = next_date,
          status = CASE
            WHEN paid_installments + 1 >= total_installments
              THEN 'completed'::public.installment_status
            ELSE 'active'::public.installment_status
          END,
          updated_at = now()
        WHERE id = inst.id;

      -- Refresh local counter
      SELECT paid_installments INTO inst.paid_installments
      FROM public.installments WHERE id = inst.id;
    END LOOP;
  END LOOP;
END;
$$;
