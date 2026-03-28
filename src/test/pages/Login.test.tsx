import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import Login from '@/pages/Login';
import { supabase } from '@/lib/supabase';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      signInWithPassword: vi.fn(),
      signInWithOAuth: vi.fn(),
    },
  },
}));

const mockNavigate = vi.fn();
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('@/components/animate-ui/text/gradient', () => ({
  GradientText: ({ text }: any) => <span>{text}</span>,
}));

vi.mock('@/components/animate-ui/icons/icon', () => ({
  AnimateIcon: ({ children }: any) => <>{children}</>,
}));

vi.mock('@/components/animate-ui/icons/log-in', () => ({
  LogIn: () => <span />,
}));

vi.mock('@/components/animate-ui/icons/loader', () => ({
  Loader: () => <span />,
}));

vi.mock('@/components/animate-ui/radix/tabs', () => ({
  Tabs: ({ children }: any) => <div>{children}</div>,
  TabsList: ({ children }: any) => <div role="tablist">{children}</div>,
  TabsTrigger: ({ children, onPointerDown }: any) => (
    <button role="tab" type="button" onPointerDown={onPointerDown}>
      {children}
    </button>
  ),
  TabsContent: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/components/RegisterUserForm', () => ({
  default: () => <div>RegisterUserForm</div>,
}));

vi.mock('@/components/ForgotPassword', () => ({
  ForgotPassword: () => (
    <button type="button">Esqueci minha senha</button>
  ),
}));

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (supabase.auth.getSession as Mock).mockResolvedValue({
      data: { session: null },
    });
  });

  it('renderiza campos de email e senha', () => {
    render(<Login />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
  });

  it('renderiza botões de login OAuth', () => {
    render(<Login />);
    expect(
      screen.getByRole('button', { name: /entrar com github/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /entrar com google/i })
    ).toBeInTheDocument();
  });

  it('renderiza o link "Esqueci minha senha"', () => {
    render(<Login />);
    expect(
      screen.getByRole('button', { name: /esqueci minha senha/i })
    ).toBeInTheDocument();
  });

  it('redireciona para dashboard se já autenticado', async () => {
    (supabase.auth.getSession as Mock).mockResolvedValue({
      data: { session: { access_token: 'token123' } },
    });
    render(<Login />);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/admin/dashboard' });
    });
  });

  it('não redireciona quando não há sessão ativa', async () => {
    render(<Login />);
    await waitFor(() => {
      expect(supabase.auth.getSession).toHaveBeenCalled();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('exibe mensagem de erro em credenciais inválidas', async () => {
    (supabase.auth.signInWithPassword as Mock).mockResolvedValue({
      error: new Error('Invalid login credentials'),
      data: { user: null },
    });
    render(<Login />);

    await userEvent.type(screen.getByLabelText('Email'), 'test@email.com');
    await userEvent.type(screen.getByLabelText('Senha'), 'senhaerrada');
    await userEvent.click(screen.getByRole('button', { name: /^entrar$/i }));

    await waitFor(() => {
      expect(
        screen.getByText('Invalid login credentials')
      ).toBeInTheDocument();
    });
  });

  it('navega para dashboard após login bem-sucedido', async () => {
    (supabase.auth.signInWithPassword as Mock).mockResolvedValue({
      error: null,
      data: { user: { id: '1', user_metadata: { displayName: 'Test' } } },
    });
    render(<Login />);

    await userEvent.type(screen.getByLabelText('Email'), 'test@email.com');
    await userEvent.type(screen.getByLabelText('Senha'), 'senha123');
    await userEvent.click(screen.getByRole('button', { name: /^entrar$/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/admin/dashboard' });
    });
  });

  it('chama signInWithOAuth com provider github', async () => {
    (supabase.auth.signInWithOAuth as Mock).mockResolvedValue({ error: null });
    render(<Login />);

    await userEvent.click(
      screen.getByRole('button', { name: /entrar com github/i })
    );

    await waitFor(() => {
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith(
        expect.objectContaining({ provider: 'github' })
      );
    });
  });

  it('chama signInWithOAuth com provider google', async () => {
    (supabase.auth.signInWithOAuth as Mock).mockResolvedValue({ error: null });
    render(<Login />);

    await userEvent.click(
      screen.getByRole('button', { name: /entrar com google/i })
    );

    await waitFor(() => {
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith(
        expect.objectContaining({ provider: 'google' })
      );
    });
  });
});
