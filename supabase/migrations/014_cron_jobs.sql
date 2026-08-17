-- Migration 014: pg_cron jobs
-- Requires pg_cron extension enabled in Supabase project settings

SELECT cron.schedule(
  'generate-recurring-transactions',
  '0 1 * * *',  -- daily at 01:00 UTC
  $$SELECT public.generate_recurring_transactions();$$
);

SELECT cron.schedule(
  'generate-installment-transactions',
  '0 2 * * *',  -- daily at 02:00 UTC
  $$SELECT public.generate_installment_transactions();$$
);

-- Expire pending invites older than 24h
SELECT cron.schedule(
  'expire-workspace-invites',
  '0 * * * *',  -- every hour
  $$
    UPDATE public.workspace_invites
    SET status = 'expired'
    WHERE status = 'pending'
      AND expires_at < now();
  $$
);
