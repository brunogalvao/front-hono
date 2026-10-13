import { API_BASE_URL } from '@/config/api';
import { getAuthToken } from '@/lib/supabase';
import type { WorkspaceInfo } from '@/model/workspace.model';
import { fetchWithAuth } from '@/lib/fetch-api';

type CreateWorkspaceResponse = {
  status: 'created';
  workspace: WorkspaceInfo & { created_at: string };
};

type WorkspaceErrorResponse = {
  error_code?: string;
};

export class WorkspaceCreationError extends Error {
  readonly code: string;

  constructor(code: string) {
    super(code);
    this.code = code;
    this.name = 'WorkspaceCreationError';
  }
}

export async function createWorkspace(name: string): Promise<WorkspaceInfo> {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/workspaces`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: name.trim() }),
  });
  const result = (await response.json().catch(() => null)) as
    | CreateWorkspaceResponse
    | WorkspaceErrorResponse
    | null;

  if (
    response.ok &&
    result &&
    'status' in result &&
    result.status === 'created'
  ) {
    return result.workspace;
  }

  throw new WorkspaceCreationError(
    result && 'error_code' in result && result.error_code
      ? result.error_code
      : 'workspace_creation_failed'
  );
}

type WorkspaceLifecycleResponse = {
  status: 'deleted' | 'left';
  workspace_id: string;
  workspace_name: string;
};

export function deleteWorkspace(
  workspaceId: string
): Promise<WorkspaceLifecycleResponse> {
  return fetchWithAuth(`/api/workspaces/${workspaceId}`, {
    method: 'DELETE',
  });
}

export function leaveWorkspace(
  workspaceId: string
): Promise<WorkspaceLifecycleResponse> {
  return fetchWithAuth(`/api/workspaces/${workspaceId}/membership`, {
    method: 'DELETE',
  });
}
