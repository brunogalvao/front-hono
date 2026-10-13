import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { WorkspaceRole, WorkspaceInfo } from '@/model/workspace.model';
import { isQueryForWorkspace, queryKeys } from '@/lib/query-keys';

export type { WorkspaceRole, WorkspaceInfo };

interface WorkspaceContextType {
  workspaces: WorkspaceInfo[];
  activeWorkspaceId: string | null;
  activeRole: WorkspaceRole | null;
  activeWorkspace: WorkspaceInfo | null;
  setWorkspaces: (workspaces: WorkspaceInfo[]) => void;
  switchWorkspace: (workspaceId: string) => void;
  activateWorkspace: (workspace: WorkspaceInfo) => void;
  removeWorkspace: (workspaceId: string) => void;
}

const STORAGE_KEY = 'active_workspace_id';

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined
);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [workspaces, setWorkspaces] = useState<WorkspaceInfo[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(
    () => localStorage.getItem(STORAGE_KEY)
  );

  const activeWorkspace =
    workspaces.find((w) => w.id === activeWorkspaceId) ?? null;
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
      void queryClient.invalidateQueries({
        predicate: (query) => isQueryForWorkspace(query.queryKey, workspaceId),
      });
    },
    [queryClient]
  );

  const activateWorkspace = useCallback(
    (workspace: WorkspaceInfo) => {
      setWorkspaces((current) => {
        const withoutAccepted = current.filter(
          (item) => item.id !== workspace.id
        );
        return [workspace, ...withoutAccepted];
      });
      setActiveWorkspaceId(workspace.id);
      localStorage.setItem(STORAGE_KEY, workspace.id);
      void queryClient.invalidateQueries({
        predicate: (query) => isQueryForWorkspace(query.queryKey, workspace.id),
      });
    },
    [queryClient]
  );

  const removeWorkspace = useCallback(
    (workspaceId: string) => {
      const remaining = workspaces.filter(
        (workspace) => workspace.id !== workspaceId
      );
      const nextWorkspace = remaining[0] ?? null;

      setWorkspaces(remaining);
      queryClient.setQueryData(queryKeys.workspaces.list, remaining);
      void queryClient.removeQueries({
        predicate: (query) => isQueryForWorkspace(query.queryKey, workspaceId),
      });

      if (activeWorkspaceId !== workspaceId) return;

      setActiveWorkspaceId(nextWorkspace?.id ?? null);
      if (nextWorkspace) {
        localStorage.setItem(STORAGE_KEY, nextWorkspace.id);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    },
    [activeWorkspaceId, queryClient, workspaces]
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
        activateWorkspace,
        removeWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx)
    throw new Error('useWorkspace must be used inside <WorkspaceProvider>');
  return ctx;
}
