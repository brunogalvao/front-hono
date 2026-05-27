import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';
import { useWorkspace, type WorkspaceInfo } from '@/context/WorkspaceContext';

async function fetchWorkspaces(): Promise<WorkspaceInfo[]> {
  const { data, error } = await supabase
    .from('workspace_members')
    .select('role, workspaces(id, name, superuser_id)')
    .order('created_at', { ascending: true });

  if (error) throw error;

  return (data ?? []).flatMap((row) => {
    const ws = row.workspaces as { id: string; name: string; superuser_id: string } | null;
    if (!ws) return [];
    return [{ id: ws.id, name: ws.name, role: row.role as WorkspaceInfo['role'], superuser_id: ws.superuser_id }];
  });
}

export function useWorkspaces() {
  const { setWorkspaces } = useWorkspace();

  const query = useQuery({
    queryKey: queryKeys.workspaces.list(),
    queryFn: fetchWorkspaces,
  });

  useEffect(() => {
    if (query.data) {
      setWorkspaces(query.data);
    }
  }, [query.data, setWorkspaces]);

  return query;
}
