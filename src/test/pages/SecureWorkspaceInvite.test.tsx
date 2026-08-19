import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import InviteLandingPage from '@/pages/auth/InviteLandingPage';
import AcceptInvitePage from '@/pages/auth/AcceptInvitePage';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  getSession: vi.fn(),
  getUser: vi.fn(),
  invoke: vi.fn(),
  fetch: vi.fn(),
  getAuthToken: vi.fn(),
  signOut: vi.fn(),
}));

const localValues = new Map<string, string>();
const localStorageMock: Storage = {
  get length() {
    return localValues.size;
  },
  clear: () => localValues.clear(),
  getItem: (key) => localValues.get(key) ?? null,
  key: (index) => [...localValues.keys()][index] ?? null,
  removeItem: (key) => {
    localValues.delete(key);
  },
  setItem: (key, value) => {
    localValues.set(key, String(value));
  },
};
vi.stubGlobal('localStorage', localStorageMock);
vi.stubGlobal('fetch', mocks.fetch);

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mocks.navigate,
}));
vi.mock('@/lib/supabase', () => ({
  getAuthToken: mocks.getAuthToken,
  supabase: {
    auth: {
      getSession: mocks.getSession,
      getUser: mocks.getUser,
      signOut: mocks.signOut,
    },
    functions: { invoke: mocks.invoke },
    from: vi.fn(() => ({
      update: vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ error: null }) })),
    })),
  },
}));

function renderWithQuery(ui: React.ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>
  );
}

describe('secure workspace invitation pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    localStorage.clear();
    window.history.replaceState({}, '', '/');
    mocks.getSession.mockResolvedValue({ data: { session: null } });
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    mocks.getAuthToken.mockResolvedValue('session-token');
  });

  it('captures and removes the token without consuming the invitation on GET', async () => {
    const token = 'a'.repeat(64);
    window.history.replaceState(
      {},
      '',
      `/auth/workspace-invite?token=${token}`
    );

    renderWithQuery(<InviteLandingPage />);

    expect(
      await screen.findByRole('button', { name: 'Continuar com segurança' })
    ).toBeInTheDocument();
    expect(window.location.search).toBe('');
    expect(sessionStorage.getItem('pendingWorkspaceInviteToken')).toBe(token);
    expect(mocks.invoke).not.toHaveBeenCalled();
    expect(document.querySelector('form')?.method).toBe('post');
  });

  it('previews, accepts explicitly, allows postponing onboarding and activates the invited workspace', async () => {
    sessionStorage.setItem('pendingWorkspaceInviteToken', 'b'.repeat(64));
    mocks.fetch
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: 'valid',
            workspace: { id: 'workspace-1', name: 'Casa' },
            inviter: { display_name: 'Admin' },
            role: 'visualizador',
            expires_at: '2026-08-18T12:00:00.000Z',
            profile_onboarding_status: 'incomplete',
          }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: 'accepted',
            workspace: { id: 'workspace-1', name: 'Casa' },
            role: 'visualizador',
            profile_onboarding_status: 'incomplete',
          }),
          { status: 200 }
        )
      );

    renderWithQuery(<AcceptInvitePage />);

    expect(await screen.findByText('Casa')).toBeInTheDocument();
    expect(mocks.fetch).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('/api/workspace-invites/operation'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ operation: 'preview', token: 'b'.repeat(64) }),
      })
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Aceitar convite' })
    );
    expect(
      await screen.findByRole('button', { name: 'Fazer isso depois' })
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'Fazer isso depois' })
    );

    await waitFor(() =>
      expect(mocks.navigate).toHaveBeenCalledWith({ to: '/admin/dashboard' })
    );
    expect(localStorage.getItem('active_workspace_id')).toBe('workspace-1');
    expect(sessionStorage.getItem('pendingWorkspaceInviteToken')).toBeNull();
  });

  it('activates the invited workspace immediately when a provisioned account needs a password', async () => {
    sessionStorage.setItem('pendingWorkspaceInviteToken', 'd'.repeat(64));
    mocks.fetch
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: 'valid',
            workspace: { id: 'workspace-guest', name: 'Equipe' },
            inviter: { display_name: 'Admin' },
            role: 'visualizador',
            expires_at: '2026-08-20T12:00:00.000Z',
            profile_onboarding_status: 'incomplete',
            password_setup_required: true,
          }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: 'accepted',
            workspace: { id: 'workspace-guest', name: 'Equipe' },
            role: 'visualizador',
            profile_onboarding_status: 'incomplete',
            password_setup_required: true,
          }),
          { status: 200 }
        )
      );

    renderWithQuery(<AcceptInvitePage />);
    await userEvent.click(
      await screen.findByRole('button', { name: 'Aceitar convite' })
    );

    await waitFor(() =>
      expect(mocks.navigate).toHaveBeenCalledWith({ to: '/admin/dashboard' })
    );
    expect(localStorage.getItem('active_workspace_id')).toBe('workspace-guest');
    expect(
      screen.queryByRole('button', { name: 'Fazer isso depois' })
    ).not.toBeInTheDocument();
  });

  it('renders email mismatch and offers account switching without accepting', async () => {
    sessionStorage.setItem('pendingWorkspaceInviteToken', 'c'.repeat(64));
    mocks.fetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          status: 'email_mismatch',
          error_code: 'email_mismatch',
        }),
        { status: 403 }
      )
    );

    renderWithQuery(<AcceptInvitePage />);

    expect(
      await screen.findByText('Use o e-mail convidado')
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'Trocar de conta' })
    );
    expect(mocks.signOut).toHaveBeenCalled();
  });
});
