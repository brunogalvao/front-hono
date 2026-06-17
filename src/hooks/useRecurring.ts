import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';

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

async function fetchRecurring(workspaceId: string): Promise<RecurringExpense[]> {
  const { data, error } = await supabase
    .from('recurring_expenses')
    .select('*, categories(id, name, icon)')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as RecurringExpense[];
}

export function useRecurring(workspaceId: string | null) {
  const queryClient = useQueryClient();
  const qKey = queryKeys.recurring.list(workspaceId ?? '');

  const query = useQuery({
    queryKey: qKey,
    queryFn: () => fetchRecurring(workspaceId!),
    enabled: !!workspaceId,
  });

  const create = useMutation({
    mutationFn: async (input: RecurringInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('recurring_expenses')
        .insert({ ...input, created_by: user!.id })
        .select()
        .single();
      if (error) throw error;

      // Gera as transações imediatamente para o mês atual, sem esperar o cron
      await supabase.rpc('generate_recurring_transactions');

      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qKey });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('recurring_expenses')
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qKey }),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...input }: Partial<RecurringInput> & { id: string }) => {
      const { data, error } = await supabase
        .from('recurring_expenses')
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select();
      if (error) throw error;
      if (!data || data.length === 0) throw new Error('Recorrência não encontrada ou sem permissão para editar.');

      // Propaga description para todas as transações vinculadas (renomear é cosmético)
      if (input.description !== undefined) {
        await supabase
          .from('transactions')
          .update({ description: input.description })
          .eq('recurring_expense_id', id);
      }

      // Propaga amount e category_id apenas para transações futuras (preserva histórico)
      const today = new Date().toISOString().split('T')[0];
      const futureFields: Record<string, unknown> = {};
      if (input.amount !== undefined) futureFields.amount = input.amount;
      if (input.category_id !== undefined) futureFields.category_id = input.category_id;
      if (Object.keys(futureFields).length > 0) {
        await supabase
          .from('transactions')
          .update(futureFields)
          .eq('recurring_expense_id', id)
          .gt('date', today);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qKey });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('recurring_expenses').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qKey }),
  });

  return { ...query, create, toggleActive, update, remove };
}
