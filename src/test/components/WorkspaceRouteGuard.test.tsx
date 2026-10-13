import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkspaceRouteGuard } from '@/components/workspace/WorkspaceRouteGuard';

const state = vi.hoisted(() => ({
  navigate: vi.fn(),
  pathname: '/admin/dashboard',
  activeWorkspace: null as { id: string } | null,
  can: vi.fn<(resource: string, action?: string) => boolean>(() => false),
  isLoading: false,
}));

vi.mock('@tanstack/react-router', () => ({
  useLocation: () => ({ pathname: state.pathname }),
  useNavigate: () => state.navigate,
}));

vi.mock('@/context/WorkspaceContext', () => ({
  useWorkspace: () => ({ activeWorkspace: state.activeWorkspace }),
}));

vi.mock('@/hooks/usePermissions', () => ({
  usePermissions: () => ({ can: state.can, isLoading: state.isLoading }),
}));

vi.mock('@/components/Loading', () => ({
  default: () => <div>Carregando acesso</div>,
}));

describe('WorkspaceRouteGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.pathname = '/admin/dashboard';
    state.activeWorkspace = null;
    state.can.mockReturnValue(false);
    state.isLoading = false;
  });

  it('não redireciona enquanto os workspaces ainda estão carregando', () => {
    render(
      <WorkspaceRouteGuard isWorkspaceLoading>
        <div>Conteúdo protegido</div>
      </WorkspaceRouteGuard>
    );

    expect(screen.getByText('Carregando acesso')).toBeInTheDocument();
    expect(state.navigate).not.toHaveBeenCalled();
  });

  it('redireciona para a primeira página permitida no workspace ativo', async () => {
    state.activeWorkspace = { id: 'workspace-1' };
    state.can.mockImplementation(
      (resource: string, action?: string) =>
        resource === 'recurring' && action === 'read'
    );

    render(
      <WorkspaceRouteGuard>
        <div>Conteúdo protegido</div>
      </WorkspaceRouteGuard>
    );

    await waitFor(() =>
      expect(state.navigate).toHaveBeenCalledWith({
        to: '/admin/recurring',
        replace: true,
      })
    );
  });
});
