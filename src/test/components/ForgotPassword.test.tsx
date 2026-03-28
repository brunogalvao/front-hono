import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import { ForgotPassword } from '@/components/ForgotPassword';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: vi.fn(),
    },
  },
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('ForgotPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza o botão de esqueci minha senha', () => {
    render(<ForgotPassword />);
    expect(
      screen.getByRole('button', { name: /esqueci minha senha/i })
    ).toBeInTheDocument();
  });

  it('abre o dialog ao clicar no botão', async () => {
    render(<ForgotPassword />);
    await userEvent.click(
      screen.getByRole('button', { name: /esqueci minha senha/i })
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('exemplo@email.com')).toBeInTheDocument();
  });

  it('exibe erro quando e-mail está vazio', async () => {
    render(<ForgotPassword />);
    await userEvent.click(
      screen.getByRole('button', { name: /esqueci minha senha/i })
    );
    await userEvent.click(screen.getByRole('button', { name: /enviar link/i }));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Informe seu e-mail.');
    });
  });

  it('chama resetPasswordForEmail com o e-mail correto', async () => {
    (supabase.auth.resetPasswordForEmail as Mock).mockResolvedValue({
      error: null,
    });
    render(<ForgotPassword />);
    await userEvent.click(
      screen.getByRole('button', { name: /esqueci minha senha/i })
    );
    await userEvent.type(
      screen.getByPlaceholderText('exemplo@email.com'),
      'bruno@email.com'
    );
    await userEvent.click(screen.getByRole('button', { name: /enviar link/i }));
    await waitFor(() => {
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'bruno@email.com',
        expect.objectContaining({ redirectTo: expect.any(String) })
      );
    });
  });

  it('exibe toast de sucesso ao enviar e-mail', async () => {
    (supabase.auth.resetPasswordForEmail as Mock).mockResolvedValue({
      error: null,
    });
    render(<ForgotPassword />);
    await userEvent.click(
      screen.getByRole('button', { name: /esqueci minha senha/i })
    );
    await userEvent.type(
      screen.getByPlaceholderText('exemplo@email.com'),
      'bruno@email.com'
    );
    await userEvent.click(screen.getByRole('button', { name: /enviar link/i }));
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining('E-mail de recuperação enviado')
      );
    });
  });

  it('exibe toast de erro quando resetPasswordForEmail falha', async () => {
    (supabase.auth.resetPasswordForEmail as Mock).mockResolvedValue({
      error: new Error('Network error'),
    });
    render(<ForgotPassword />);
    await userEvent.click(
      screen.getByRole('button', { name: /esqueci minha senha/i })
    );
    await userEvent.type(
      screen.getByPlaceholderText('exemplo@email.com'),
      'bruno@email.com'
    );
    await userEvent.click(screen.getByRole('button', { name: /enviar link/i }));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Erro ao enviar e-mail de recuperação.'
      );
    });
  });

  it('fecha o dialog ao clicar em Cancelar', async () => {
    render(<ForgotPassword />);
    await userEvent.click(
      screen.getByRole('button', { name: /esqueci minha senha/i })
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
