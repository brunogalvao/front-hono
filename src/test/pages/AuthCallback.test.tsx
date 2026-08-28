import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AuthCallback from '@/pages/AuthCallback';
import { storeWorkspaceInviteToken } from '@/lib/workspace-invite-session';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  getSession: vi.fn(),
}));

const localValues = new Map<string, string>();
vi.stubGlobal('localStorage', {
  get length() {
    return localValues.size;
  },
  clear: () => localValues.clear(),
  getItem: (key: string) => localValues.get(key) ?? null,
  key: (index: number) => [...localValues.keys()][index] ?? null,
  removeItem: (key: string) => localValues.delete(key),
  setItem: (key: string, value: string) => localValues.set(key, String(value)),
} satisfies Storage);

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mocks.navigate,
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: mocks.getSession,
    },
  },
}));

describe('authentication callback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    localStorage.clear();
    window.history.replaceState({}, '', '/auth/callback');
    mocks.getSession.mockResolvedValue({
      data: { session: { access_token: 'session-token' } },
    });
  });

  it('continues a pending invitation even when the auth redirect omits flow', async () => {
    storeWorkspaceInviteToken('a'.repeat(64));

    render(<AuthCallback />);

    await waitFor(() =>
      expect(mocks.navigate).toHaveBeenCalledWith({
        to: '/auth/accept-invite',
      })
    );
  });

  it('uses the regular destination when no invitation is pending', async () => {
    window.history.replaceState(
      {},
      '',
      '/auth/callback?next=%2Fadmin%2Ftransactions'
    );

    render(<AuthCallback />);

    await waitFor(() =>
      expect(mocks.navigate).toHaveBeenCalledWith({
        to: '/admin/transactions',
      })
    );
  });
});
