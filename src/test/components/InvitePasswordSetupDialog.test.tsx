import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InvitePasswordSetupDialog } from '@/components/workspace/InvitePasswordSetupDialog';

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  updateUser: vi.fn(),
  maybeSingle: vi.fn(),
  updateProfile: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: mocks.getUser,
      updateUser: mocks.updateUser,
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({ maybeSingle: mocks.maybeSingle })),
      })),
      update: vi.fn(() => ({ eq: mocks.updateProfile })),
    })),
  },
}));

describe('InvitePasswordSetupDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUser.mockResolvedValue({
      data: { user: { id: 'guest-1' } },
    });
    mocks.maybeSingle.mockResolvedValue({
      data: { full_name: null, password_setup_required: true },
      error: null,
    });
    mocks.updateUser.mockResolvedValue({ error: null });
    mocks.updateProfile.mockResolvedValue({ error: null });
  });

  it('asks an invitation-provisioned user to create a password', async () => {
    render(<InvitePasswordSetupDialog />);

    expect(
      await screen.findByRole('heading', {
        name: 'Crie sua senha de acesso',
      })
    ).toBeInTheDocument();

    await userEvent.type(
      screen.getByLabelText('Nome completo (opcional)'),
      'Pessoa Convidada'
    );
    await userEvent.type(screen.getByLabelText('Nova senha'), 'Senha123!');
    await userEvent.type(
      screen.getByLabelText('Confirmar nova senha'),
      'Senha123!'
    );
    await userEvent.click(screen.getByRole('button', { name: 'Criar senha' }));

    await waitFor(() =>
      expect(mocks.updateUser).toHaveBeenCalledWith({ password: 'Senha123!' })
    );
    expect(mocks.updateProfile).toHaveBeenCalledWith('id', 'guest-1');
    await waitFor(() =>
      expect(
        screen.queryByRole('heading', { name: 'Crie sua senha de acesso' })
      ).not.toBeInTheDocument()
    );
  });
});
