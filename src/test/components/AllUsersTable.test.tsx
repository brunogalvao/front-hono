import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AllUsersTable } from '@/components/workspace/AllUsersTable';
import type { AppUser } from '@/model/user.model';
import type { PendingInvite } from '@/model/workspace-member.model';

const workspaceMembers = vi.hoisted(() => ({
  updateRole: { mutateAsync: vi.fn() },
  removeMember: { mutateAsync: vi.fn() },
}));

vi.mock('@/hooks/useWorkspaceMembers', () => ({
  useWorkspaceMembers: () => workspaceMembers,
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock('@/components/workspace/GuestPermissionEditor', () => ({
  GuestPermissionEditor: () => null,
}));

function renderTable({
  user,
  pendingInvites = [],
  onResendInvite = vi.fn().mockResolvedValue(undefined),
  onCancelInvite = vi.fn().mockResolvedValue(undefined),
  page = 1,
  pageCount = 1,
  total = 1,
  onPageChange = vi.fn(),
}: {
  user: AppUser;
  pendingInvites?: PendingInvite[];
  onResendInvite?: (inviteId: string) => Promise<unknown>;
  onCancelInvite?: (inviteId: string) => Promise<unknown>;
  page?: number;
  pageCount?: number;
  total?: number;
  onPageChange?: (page: number) => void;
}) {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <AllUsersTable
        users={[user]}
        isLoading={false}
        currentUserId="current-user"
        workspaceId="workspace-1"
        isSuperAdmin
        pendingInvites={pendingInvites}
        onResendInvite={onResendInvite}
        onCancelInvite={onCancelInvite}
        page={page}
        pageCount={pageCount}
        total={total}
        onPageChange={onPageChange}
      />
    </QueryClientProvider>
  );

  return { onResendInvite, onCancelInvite, onPageChange };
}

const profile = {
  id: 'invited-user',
  email: 'person@example.com',
  full_name: 'Pessoa convidada',
  avatar_url: null,
};

describe('AllUsersTable', () => {
  beforeEach(() => vi.clearAllMocks());

  it('permite reenviar ou cancelar um convite pendente do usuário', async () => {
    const invite: PendingInvite = {
      id: 'invite-1',
      email_normalized: profile.email,
      role: 'visualizador',
      status: 'pending',
      delivery_status: 'sent',
      expires_at: null,
      sent_at: null,
      last_delivery_attempt_at: null,
      created_at: '2026-08-18T12:00:00.000Z',
    };
    const actions = renderTable({
      user: { profile, role: null, memberId: null },
      pendingInvites: [invite],
    });

    expect(screen.getByText('Convite pendente')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Reenviar' }));
    await userEvent.click(
      screen.getByRole('button', { name: 'Cancelar convite' })
    );

    expect(actions.onResendInvite).toHaveBeenCalledWith(invite.id);
    expect(actions.onCancelInvite).toHaveBeenCalledWith(invite.id);
  });

  it('oferece remoção para membro ativo sem exibir reenvio', () => {
    renderTable({
      user: {
        profile,
        role: 'visualizador',
        memberId: 'member-1',
      },
    });

    expect(screen.getByRole('button', { name: 'Remover' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Reenviar' })
    ).not.toBeInTheDocument();
  });

  it('navega pelas páginas da lista de usuários', async () => {
    const actions = renderTable({
      user: { profile, role: null, memberId: null },
      page: 1,
      pageCount: 3,
      total: 25,
    });

    expect(screen.getByText('Página 1 de 3')).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'Próxima página' })
    );
    expect(actions.onPageChange).toHaveBeenCalledWith(2);
  });
});
