import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';

export interface Category {
  id: string;
  name: string;
  type: 'receita' | 'despesa';
  is_default: boolean;
  workspace_id: string | null;
  icon: string | null;
}

async function fetchCategories(workspaceId: string): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, type, is_default, workspace_id, icon')
    .eq('workspace_id', workspaceId)
    .order('name');

  if (error) throw error;
  return data ?? [];
}

export function useCategories(workspaceId: string | null) {
  return useQuery({
    queryKey: queryKeys.categories.list(workspaceId ?? ''),
    queryFn: () => fetchCategories(workspaceId!),
    enabled: !!workspaceId,
  });
}
