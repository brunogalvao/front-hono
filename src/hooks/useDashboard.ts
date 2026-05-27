import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';

export interface DashboardSummary {
  total_receitas: number;
  total_despesas: number;
  saldo: number;
  by_category: { category_id: string | null; category_name: string; total: number; type: string }[];
}

async function buildSummary(
  workspaceId: string,
  month: number,
  year: number,
  userId?: string,
): Promise<DashboardSummary> {
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

  let query = supabase
    .from('transactions')
    .select('type, amount, category_id, categories(id, name, type)')
    .eq('workspace_id', workspaceId)
    .gte('date', start)
    .lte('date', end);

  if (userId) query = query.eq('created_by', userId);

  const { data, error } = await query;
  if (error) throw error;

  const rows = data ?? [];
  const total_receitas = rows
    .filter((r) => r.type === 'receita')
    .reduce((sum, r) => sum + r.amount, 0);
  const total_despesas = rows
    .filter((r) => r.type === 'despesa')
    .reduce((sum, r) => sum + r.amount, 0);

  const catMap = new Map<string, { category_name: string; total: number; type: string }>();
  for (const r of rows) {
    const key = r.category_id ?? '__none__';
    const cat = r.categories as { id: string; name: string; type: string } | null;
    const name = cat?.name ?? 'Sem categoria';
    const existing = catMap.get(key);
    catMap.set(key, {
      category_name: name,
      total: (existing?.total ?? 0) + r.amount,
      type: r.type,
    });
  }

  const by_category = Array.from(catMap.entries())
    .map(([category_id, v]) => ({ category_id: category_id === '__none__' ? null : category_id, ...v }))
    .sort((a, b) => b.total - a.total);

  return { total_receitas, total_despesas, saldo: total_receitas - total_despesas, by_category };
}

export function useDashboard(workspaceId: string | null, month: number, year: number) {
  const workspaceSummary = useQuery({
    queryKey: queryKeys.dashboard.workspace(workspaceId ?? '', month, year),
    queryFn: () => buildSummary(workspaceId!, month, year),
    enabled: !!workspaceId,
  });

  const individualSummary = useQuery({
    queryKey: queryKeys.dashboard.individual(workspaceId ?? '', month, year),
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return buildSummary(workspaceId!, month, year, user?.id);
    },
    enabled: !!workspaceId,
  });

  return { workspaceSummary, individualSummary };
}
