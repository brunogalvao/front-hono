import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PendingInviteList } from '@/components/workspace/PendingInviteList';
import AcceptInvitePage from '@/pages/auth/AcceptInvitePage';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  getUser: vi.fn(),
  invoke: vi.fn(),
  fetch: vi.fn(),
  getAuthToken: vi.fn(),
  signOut: vi.fn(),
}));

const localValues = new Map<string, string>();
vi.stubGlobal('localStorage', {
  get length() {
    return localValues.size;
  },
  clear: () => localValues.clear(),
  getItem: (key: string) => localValues.get(key) ?? null,
  key: (index: number) => [...localValues.keys()][index] ?? null,
  removeItem: (key: string) => {
    localValues.delete(key);
  },
  setItem: (key: string, value: string) => {
    localValues.set(key, String(value));
  },
} satisfies Storage);
vi.stubGlobal('fetch', mocks.fetch);

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mocks.navigate,
}));
vi.mock('@/lib/supabase', () => ({
  getAuthToken: mocks.getAuthToken,
  supabase: {
    auth: { getUser: mocks.getUser, signOut: mocks.signOut },
    functions: { invoke: mocks.invoke },
    from: vi.fn(() => ({
      update: vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ error: null }) })),
    })),
  },
}));

function renderWithQuery(ui: React.ReactNode) {
  return render(
    <QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>
  );
}

describe('invitation lifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    localValues.clear();
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    mocks.getAuthToken.mockResolvedValue('session-token');
  });

  it('lists delivery state and calls resend/cancel actions', async () => {
    const resend = vi.fn().mockResolvedValue(undefined);
    const cancel = vi.fn().mockResolvedValue(undefined);
    render(
      <PendingInviteList
        invites={[
          {
            id: 'invite-1',
            email_normalized: 'person@example.com',
            role: 'visualizador',
            status: 'pending',
            delivery_status: 'failed',
            expires_at: null,
            sent_at: null,
            last_delivery_attempt_at: '2026-08-17T12:00:00.000Z',
            created_at: '2026-08-17T12:00:00.000Z',
          },
        ]}
        isLoading={false}
        onResend={resend}
        onCancel={cancel}
      />
    );
    expect(screen.getByText(/falha no envio/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Reenviar/ }));
    await userEvent.click(
      screen.getByRole('button', { name: /Cancelar convite/ })
    );
    expect(resend).toHaveBeenCalledWith('invite-1');
    expect(cancel).toHaveBeenCalledWith('invite-1');
  });

  it('shows an expired invite while keeping resend and cancel available', () => {
    render(
      <PendingInviteList
        invites={[
          {
            id: 'invite-expired',
            email_normalized: 'expired@example.com',
            role: 'operador',
            status: 'expired',
            delivery_status: 'sent',
            expires_at: '2026-08-17T12:00:00.000Z',
            sent_at: '2026-08-16T12:00:00.000Z',
            last_delivery_attempt_at: '2026-08-16T12:00:00.000Z',
            created_at: '2026-08-16T12:00:00.000Z',
          },
        ]}
        isLoading={false}
        onResend={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByText(/Expirado/)).toBeInTheDocument();
    expect(screen.getByText(/Resend: enviado/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reenviar/ })).toBeEnabled();
  });

  it.each([
    ['expired', 'Convite expirado'],
    ['cancelled', 'Convite cancelado'],
    ['already_accepted', 'Convite já utilizado'],
  ] as const)(
    'renders terminal state %s without invoking accept',
    async (status, title) => {
      sessionStorage.setItem('pendingWorkspaceInviteToken', 'a'.repeat(64));
      mocks.fetch.mockResolvedValue(
        new Response(
          JSON.stringify({ status, error_code: `invite_${status}` }),
          { status: 410 }
        )
      );

      renderWithQuery(<AcceptInvitePage />);
      expect(await screen.findByText(title)).toBeInTheDocument();
      await waitFor(() => expect(mocks.fetch).toHaveBeenCalledTimes(1));
      expect(sessionStorage.getItem('pendingWorkspaceInviteToken')).toBeNull();
      expect(mocks.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/workspace-invites/operation'),
        expect.objectContaining({
          body: JSON.stringify({
            operation: 'preview',
            token: 'a'.repeat(64),
          }),
        })
      );
    }
  );
});
