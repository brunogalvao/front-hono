import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import RegisterUserForm from '@/components/RegisterUserForm';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
    },
  },
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('@/components/animate-ui/icons/icon', () => ({
  AnimateIcon: ({ children }: any) => <>{children}</>,
}));

vi.mock('@/components/animate-ui/icons/send', () => ({
  Send: () => <span />,
}));

vi.mock('@/components/animate-ui/icons/loader', () => ({
  Loader: () => <span />,
}));

describe('RegisterUserForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza todos os campos do formulário', () => {
    render(<RegisterUserForm />);
    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirmar Senha')).toBeInTheDocument();
  });

  it('exibe erro quando nome está vazio', async () => {
    render(<RegisterUserForm />);
    await userEvent.click(screen.getByRole('button', { name: /cadastrar/i }));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('O nome é obrigatório.');
    });
  });

  it('exibe erro quando e-mail é inválido', async () => {
    render(<RegisterUserForm />);
    await userEvent.type(screen.getByLabelText('Nome'), 'Bruno');
    await userEvent.type(screen.getByLabelText('Email'), 'emailinvalido');
    await userEvent.type(screen.getByLabelText('Senha'), 'senha123');
    await userEvent.type(screen.getByLabelText('Confirmar Senha'), 'senha123');
    // fireEvent.submit bypasses HTML5 native email validation,
    // allowing the Zod schema to validate instead
    const form = screen
      .getByRole('button', { name: /cadastrar/i })
      .closest('form')!;
    fireEvent.submit(form);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('E-mail inválido.');
    });
  });

  it('exibe erro quando senhas não coincidem', async () => {
    render(<RegisterUserForm />);
    await userEvent.type(screen.getByLabelText('Nome'), 'Bruno');
    await userEvent.type(screen.getByLabelText('Email'), 'bruno@email.com');
    await userEvent.type(screen.getByLabelText('Senha'), 'senha123');
    await userEvent.type(screen.getByLabelText('Confirmar Senha'), 'diferente');
    await userEvent.click(screen.getByRole('button', { name: /cadastrar/i }));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('As senhas não coincidem.');
    });
  });

  it('exibe toast de sucesso no cadastro bem-sucedido', async () => {
    (supabase.auth.signUp as Mock).mockResolvedValue({
      data: { user: { id: '1', identities: [{ id: '1' }] } },
      error: null,
    });
    render(<RegisterUserForm />);
    await userEvent.type(screen.getByLabelText('Nome'), 'Bruno');
    await userEvent.type(screen.getByLabelText('Email'), 'bruno@email.com');
    await userEvent.type(screen.getByLabelText('Senha'), 'senha123');
    await userEvent.type(screen.getByLabelText('Confirmar Senha'), 'senha123');
    await userEvent.click(screen.getByRole('button', { name: /cadastrar/i }));
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        'Cadastro realizado com sucesso! Verifique seu e-mail.'
      );
    });
  });

  it('exibe erro quando e-mail já está cadastrado', async () => {
    (supabase.auth.signUp as Mock).mockResolvedValue({
      data: { user: { id: '1', identities: [] } },
      error: null,
    });
    render(<RegisterUserForm />);
    await userEvent.type(screen.getByLabelText('Nome'), 'Bruno');
    await userEvent.type(screen.getByLabelText('Email'), 'existente@email.com');
    await userEvent.type(screen.getByLabelText('Senha'), 'senha123');
    await userEvent.type(screen.getByLabelText('Confirmar Senha'), 'senha123');
    await userEvent.click(screen.getByRole('button', { name: /cadastrar/i }));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Este e-mail já está cadastrado. Verifique sua caixa de entrada ou spam.'
      );
    });
  });

  it('exibe erro quando signUp retorna erro da API', async () => {
    (supabase.auth.signUp as Mock).mockResolvedValue({
      data: { user: null },
      error: new Error('Signup error'),
    });
    render(<RegisterUserForm />);
    await userEvent.type(screen.getByLabelText('Nome'), 'Bruno');
    await userEvent.type(screen.getByLabelText('Email'), 'bruno@email.com');
    await userEvent.type(screen.getByLabelText('Senha'), 'senha123');
    await userEvent.type(screen.getByLabelText('Confirmar Senha'), 'senha123');
    await userEvent.click(screen.getByRole('button', { name: /cadastrar/i }));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Erro ao cadastrar')
      );
    });
  });
});
