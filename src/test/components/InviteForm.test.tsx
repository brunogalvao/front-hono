import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InviteForm } from '@/components/workspace/InviteForm';

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn(), warning: vi.fn() }));

vi.mock('sonner', () => ({ toast }));

describe('InviteForm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('normaliza o e-mail e envia o papel padrão', async () => {
    const onInvite = vi.fn().mockResolvedValue({ status: 'sent' });
    render(<InviteForm onInvite={onInvite} />);

    await userEvent.type(screen.getByLabelText('E-mail'), '  Person@Example.COM  ');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar convite' }));

    await waitFor(() => {
      expect(onInvite).toHaveBeenCalledWith('person@example.com', 'visualizador');
    });
    expect(toast.success).toHaveBeenCalled();
  });

  it('representa delivery_failed sem expor link copiável', async () => {
    const onInvite = vi.fn().mockResolvedValue({ status: 'delivery_failed' });
    render(<InviteForm onInvite={onInvite} />);

    await userEvent.type(screen.getByLabelText('E-mail'), 'person@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar convite' }));

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(screen.queryByRole('button', { name: /copiar/i })).not.toBeInTheDocument();
  });

  it.each(['already_member', 'existing_pending_invite', 'rate_limited'])(
    'mapeia o estado público %s sem lançar erro técnico',
    async (status) => {
      const onInvite = vi.fn().mockResolvedValue({ status, retry_after: 60 });
      render(<InviteForm onInvite={onInvite} />);

      await userEvent.type(screen.getByLabelText('E-mail'), 'person@example.com');
      await userEvent.click(screen.getByRole('button', { name: 'Enviar convite' }));

      await waitFor(() => expect(toast.warning).toHaveBeenCalled());
    },
  );
});
