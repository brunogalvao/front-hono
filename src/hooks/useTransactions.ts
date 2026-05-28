import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';

export type TransactionStatus = 'pago' | 'pendente';

export interface Transaction {
  id: string;
  workspace_id: string;
  category_id: string | null;
  created_by: string;
  type: 'receita' | 'despesa';
  origin: 'manual' | 'recurring' | 'installment';
  status: TransactionStatus;
  amount: number;
  description: string | null;
  date: string;
  recurring_expense_id: string | null;
  installment_id: string | null;
  created_at: string;
  categories?: { id: string; name: string; type: string } | null;
  profiles?: { id: string; full_name: string | null } | null;
}

export interface TransactionInput {
  workspace_id: string;
  category_id?: string | null;
  type: 'receita' | 'despesa';
  status?: TransactionStatus;
  amount: number;
  description?: string | null;
  date: string;
}

async function fetchTransactions(
  workspaceId: string,
  month: number,
  year: number,
): Promise<Transaction[]> {
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

  const { data, error } = await supabase
    .from('transactions')
    .select('*, categories(id, name, type), profiles(id, full_name)')
    .eq('workspace_id', workspaceId)
    .gte('date', start)
    .lte('date', end)
    .order('date', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Transaction[];
}

export function useTransactions(workspaceId: string | null, month: number, year: number) {
  const queryClient = useQueryClient();
  const qKey = queryKeys.transactions.list(workspaceId ?? '', month, year);

  const query = useQuery({
    queryKey: qKey,
    queryFn: () => fetchTransactions(workspaceId!, month, year),
    enabled: !!workspaceId,
  });

  const create = useMutation({
    mutationFn: async (input: TransactionInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('transactions')
        .insert({ ...input, created_by: user!.id, origin: 'manual' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qKey }),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...input }: Partial<TransactionInput> & { id: string }) => {
      const { data, error } = await supabase
        .from('transactions')
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qKey }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qKey }),
  });

  return { ...query, create, update, remove };
}
