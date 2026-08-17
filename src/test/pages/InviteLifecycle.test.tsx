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

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mocks.navigate,
}));
vi.mock('@/lib/supabase', () => ({
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
    expect(screen.getByText(/Falha no envio/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Reenviar/ }));
    await userEvent.click(
      screen.getByRole('button', { name: /Cancelar convite/ })
    );
    expect(resend).toHaveBeenCalledWith('invite-1');
    expect(cancel).toHaveBeenCalledWith('invite-1');
  });

  it.each([
    ['expired', 'Convite expirado'],
    ['cancelled', 'Convite cancelado'],
    ['already_accepted', 'Convite já utilizado'],
  ] as const)(
    'renders terminal state %s without invoking accept',
    async (status, title) => {
      sessionStorage.setItem('pendingWorkspaceInviteToken', 'a'.repeat(64));
      mocks.invoke.mockResolvedValue({
        data: null,
        error: {
          context: new Response(
            JSON.stringify({ status, error_code: `invite_${status}` }),
            {
              status: 410,
            }
          ),
        },
      });

      renderWithQuery(<AcceptInvitePage />);
      expect(await screen.findByText(title)).toBeInTheDocument();
      await waitFor(() => expect(mocks.invoke).toHaveBeenCalledTimes(1));
      expect(mocks.invoke).toHaveBeenCalledWith('accept-invite', {
        body: { operation: 'preview', token: 'a'.repeat(64) },
      });
    }
  );
});
