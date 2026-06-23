import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';
import type { Installment, InstallmentInput, InstallmentUpdateInput } from '@/model/installment.model';

export type { Installment, InstallmentInput, InstallmentUpdateInput };

// T001 — helper para calcular a data de cada parcela
function addMonths(dateStr: string, offset: number): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const totalMonths = year * 12 + (month - 1) + offset;
  const newYear = Math.floor(totalMonths / 12);
  const newMonth = (totalMonths % 12) + 1;
  // Clamp ao último dia do mês destino (ex.: 2027-02-29 → 2027-02-28)
  const lastDay = new Date(newYear, newMonth, 0).getDate();
  const clampedDay = Math.min(day, lastDay);
  return `${newYear}-${String(newMonth).padStart(2, '0')}-${String(clampedDay).padStart(2, '0')}`;
}

export function calcInstallmentAmount(total: number, count: number) {
  const base = Math.floor((total / count) * 100) / 100;
  const remainder = Math.round((total - base * count) * 100) / 100;
  return { installment_amount: base, remainder_amount: remainder };
}

// T004 — progresso calculado a partir das transactions reais
async function fetchInstallments(workspaceId: string): Promise<Installment[]> {
  const { data: items, error } = await supabase
    .from('installments')
    .select('*, categories(id, name)')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!items || items.length === 0) return [];

  const ids = items.map((i) => i.id);

  const { data: paidTx } = await supabase
    .from('transactions')
    .select('installment_id')
    .eq('workspace_id', workspaceId)
    .eq('status', 'pago')
    .in('installment_id', ids);

  const paidMap = (paidTx ?? []).reduce(
    (acc, t) => {
      if (t.installment_id) acc[t.installment_id] = (acc[t.installment_id] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return items.map((i) => ({ ...i, paid_installments: paidMap[i.id] ?? 0 })) as Installment[];
}

export function useInstallments(workspaceId: string | null) {
  const queryClient = useQueryClient();
  const qKey = queryKeys.installments.list(workspaceId ?? '');

  const query = useQuery({
    queryKey: qKey,
    queryFn: () => fetchInstallments(workspaceId!),
    enabled: !!workspaceId,
  });

  // T002 — gera N transactions após criar o installment
  const create = useMutation({
    mutationFn: async (input: InstallmentInput) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { installment_amount, remainder_amount } = calcInstallmentAmount(
        input.total_amount,
        input.total_installments,
      );

      const { data: inst, error } = await supabase
        .from('installments')
        .insert({ ...input, created_by: user!.id, installment_amount, remainder_amount })
        .select()
        .single();
      if (error) throw error;

      const transactions = Array.from({ length: input.total_installments }, (_, i) => {
        const num = i + 1;
        const isLast = num === input.total_installments;
        return {
          workspace_id: input.workspace_id,
          category_id: input.category_id ?? null,
          created_by: user!.id,
          description: input.description,
          type: 'despesa' as const,
          origin: 'installment' as const,
          status: 'pendente' as const,
          installment_id: inst.id,
          installment_number: num,
          amount: isLast ? installment_amount + remainder_amount : installment_amount,
          date: addMonths(input.first_installment_date, i),
        };
      });

      const { error: txError } = await supabase.from('transactions').insert(transactions);
      if (txError) throw txError;

      return inst;
    },
    // T003 — invalida também o cache de transactions
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qKey });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
    },
  });

  // T005 — marca transactions pendentes como pagas e atualiza status do installment
  const earlyPayoff = useMutation({
    mutationFn: async (id: string) => {
      const { error: txError } = await supabase
        .from('transactions')
        .update({ status: 'pago', updated_at: new Date().toISOString() })
        .eq('installment_id', id)
        .eq('status', 'pendente');
      if (txError) throw txError;

      const { error } = await supabase
        .from('installments')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    // T006 — invalida também o cache de transactions
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qKey });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, ...input }: InstallmentUpdateInput & { id: string }) => {
      const { error } = await supabase
        .from('installments')
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;

      // Propaga description e category_id para todas as transações vinculadas
      const txAllFields: Record<string, unknown> = {};
      if (input.description !== undefined) txAllFields.description = input.description;
      if (input.category_id !== undefined) txAllFields.category_id = input.category_id;
      if (Object.keys(txAllFields).length > 0) {
        await supabase.from('transactions').update(txAllFields).eq('installment_id', id);
      }

      // Propaga installment_amount apenas para parcelas pendentes
      if (input.installment_amount !== undefined) {
        await supabase
          .from('transactions')
          .update({ amount: input.installment_amount })
          .eq('installment_id', id)
          .eq('status', 'pendente');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qKey });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
    },
  });

  // T008 — deleta transactions antes de deletar o installment
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error: txError } = await supabase
        .from('transactions')
        .delete()
        .eq('installment_id', id);
      if (txError) throw txError;

      const { error } = await supabase.from('installments').delete().eq('id', id);
      if (error) throw error;
    },
    // T009 — invalida também o cache de transactions
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qKey });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
    },
  });

  return { ...query, create, update, earlyPayoff, remove };
}
