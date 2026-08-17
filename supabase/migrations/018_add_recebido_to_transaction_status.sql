-- Migration 018: Ensure transaction status exists and supports income receipts.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'transaction_status') then
    create type public.transaction_status as enum ('pago', 'pendente', 'recebido');
  end if;
end
$$;

alter type public.transaction_status add value if not exists 'recebido';

alter table public.transactions
  add column if not exists status public.transaction_status not null default 'pendente';
