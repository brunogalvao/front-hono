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

function renderTable({
  user,
  pendingInvites = [],
  onResendInvite = vi.fn().mockResolvedValue(undefined),
  onCancelInvite = vi.fn().mockResolvedValue(undefined),
}: {
  user: AppUser;
  pendingInvites?: PendingInvite[];
  onResendInvite?: (inviteId: string) => Promise<unknown>;
  onCancelInvite?: (inviteId: string) => Promise<unknown>;
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
      />
    </QueryClientProvider>
  );

  return { onResendInvite, onCancelInvite };
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
});
