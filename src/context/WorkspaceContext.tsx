import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export type WorkspaceRole = 'super_administrador' | 'administrador' | 'operador' | 'visualizador';

export interface WorkspaceInfo {
  id: string;
  name: string;
  role: WorkspaceRole;
  superuser_id: string;
}

interface WorkspaceContextType {
  workspaces: WorkspaceInfo[];
  activeWorkspaceId: string | null;
  activeRole: WorkspaceRole | null;
  activeWorkspace: WorkspaceInfo | null;
  setWorkspaces: (workspaces: WorkspaceInfo[]) => void;
  switchWorkspace: (workspaceId: string) => void;
}

const STORAGE_KEY = 'active_workspace_id';

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [workspaces, setWorkspaces] = useState<WorkspaceInfo[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(
    () => localStorage.getItem(STORAGE_KEY),
  );

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) ?? null;
  const activeRole = activeWorkspace?.role ?? null;

  // When workspaces load, auto-select one if needed
  useEffect(() => {
    if (workspaces.length === 0) return;
    const stored = localStorage.getItem(STORAGE_KEY);
    const valid = stored && workspaces.some((w) => w.id === stored);
    if (!valid) {
      const first = workspaces[0].id;
      setActiveWorkspaceId(first);
      localStorage.setItem(STORAGE_KEY, first);
    }
  }, [workspaces]);

  const switchWorkspace = useCallback(
    (workspaceId: string) => {
      setActiveWorkspaceId(workspaceId);
      localStorage.setItem(STORAGE_KEY, workspaceId);
      queryClient.invalidateQueries();
    },
    [queryClient],
  );

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspaceId,
        activeRole,
        activeWorkspace,
        setWorkspaces,
        switchWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used inside <WorkspaceProvider>');
  return ctx;
}
