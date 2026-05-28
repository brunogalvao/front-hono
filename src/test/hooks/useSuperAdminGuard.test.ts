import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';

const { mockNavigate, mockToastError, mockUseWorkspace, mockGetUser } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockToastError: vi.fn(),
  mockUseWorkspace: vi.fn(),
  mockGetUser: vi.fn(),
}));

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('sonner', () => ({
  toast: { error: mockToastError, success: vi.fn() },
}));

vi.mock('@/lib/supabase', () => ({
  supabase: { auth: { getUser: mockGetUser } },
}));

vi.mock('@/context/WorkspaceContext', () => ({
  useWorkspace: mockUseWorkspace,
}));

import { useSuperAdminGuard } from '@/hooks/useSuperAdminGuard';

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useSuperAdminGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna isAllowed: true quando usuário é super admin', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-super' } } });
    mockUseWorkspace.mockReturnValue({
      activeWorkspace: { id: 'ws-1', superuser_id: 'user-super', name: 'WS', role: 'administrador' },
    });

    const { result } = renderHook(() => useSuperAdminGuard(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isAllowed).toBe(true);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockToastError).not.toHaveBeenCalled();
  });

  it('retorna isAllowed: false e dispara navigate quando não é super admin', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-common' } } });
    mockUseWorkspace.mockReturnValue({
      activeWorkspace: { id: 'ws-1', superuser_id: 'user-super', name: 'WS', role: 'administrador' },
    });

    const { result } = renderHook(() => useSuperAdminGuard(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isAllowed).toBe(false);
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/admin/dashboard' });
    expect(mockToastError).toHaveBeenCalledWith('Acesso restrito ao super admin');
  });

  it('retorna isLoading: true enquanto workspace não está disponível', () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-super' } } });
    mockUseWorkspace.mockReturnValue({ activeWorkspace: null });

    const { result } = renderHook(() => useSuperAdminGuard(), { wrapper: makeWrapper() });

    expect(result.current.isLoading).toBe(true);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
