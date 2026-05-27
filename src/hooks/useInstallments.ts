import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';

export interface Installment {
  id: string;
  workspace_id: string;
  category_id: string | null;
  created_by: string;
  description: string;
  total_amount: number;
  installment_amount: number;
  remainder_amount: number;
  total_installments: number;
  paid_installments: number;
  first_installment_date: string;
  status: 'active' | 'completed' | 'cancelled';
  last_generated_date: string | null;
  created_at: string;
  categories?: { id: string; name: string } | null;
}

export interface InstallmentInput {
  workspace_id: string;
  description: string;
  total_amount: number;
  total_installments: number;
  first_installment_date: string;
  category_id?: string | null;
}

function calcInstallmentAmount(total: number, count: number) {
  const base = Math.floor((total / count) * 100) / 100;
  const remainder = Math.round((total - base * count) * 100) / 100;
  return { installment_amount: base, remainder_amount: remainder };
}

async function fetchInstallments(workspaceId: string): Promise<Installment[]> {
  const { data, error } = await supabase
    .from('installments')
    .select('*, categories(id, name)')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Installment[];
}

export function useInstallments(workspaceId: string | null) {
  const queryClient = useQueryClient();
  const qKey = queryKeys.installments.list(workspaceId ?? '');

  const query = useQuery({
    queryKey: qKey,
    queryFn: () => fetchInstallments(workspaceId!),
    enabled: !!workspaceId,
  });

  const create = useMutation({
    mutationFn: async (input: InstallmentInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { installment_amount, remainder_amount } = calcInstallmentAmount(
        input.total_amount,
        input.total_installments,
      );
      const { data, error } = await supabase
        .from('installments')
        .insert({
          ...input,
          created_by: user!.id,
          installment_amount,
          remainder_amount,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qKey }),
  });

  const earlyPayoff = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('installments')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qKey }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('installments').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qKey }),
  });

  return { ...query, create, earlyPayoff, remove };
}

export { calcInstallmentAmount };
