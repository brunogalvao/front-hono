import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';

export interface Insight {
  category: string;
  observation: string;
  suggestion: string;
}

async function fetchInsights(
  workspaceId: string,
  month: number,
  year: number,
  scope: 'workspace' | 'individual',
): Promise<Insight[]> {
  const { data, error } = await supabase.functions.invoke('generate-insights', {
    body: { workspace_id: workspaceId, period_month: month, period_year: year, scope },
  });

  if (error) throw error;
  return (data?.content ?? []) as Insight[];
}

export function useInsights(workspaceId: string | null, month: number, year: number) {
  const workspaceInsights = useQuery({
    queryKey: queryKeys.insights.workspace(workspaceId ?? '', month, year),
    queryFn: () => fetchInsights(workspaceId!, month, year, 'workspace'),
    enabled: !!workspaceId,
    staleTime: 6 * 60 * 60 * 1000, // 6h to match Edge Function cache
  });

  const individualInsights = useQuery({
    queryKey: queryKeys.insights.individual(workspaceId ?? '', month, year),
    queryFn: () => fetchInsights(workspaceId!, month, year, 'individual'),
    enabled: !!workspaceId,
    staleTime: 6 * 60 * 60 * 1000,
  });

  return { workspaceInsights, individualInsights };
}
