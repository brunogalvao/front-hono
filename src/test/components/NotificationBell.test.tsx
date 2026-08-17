import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationBell } from '@/components/NotificationBell';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  transactions: [
    {
      id: 'transaction-1',
      workspace_id: 'workspace-1',
      category_id: 'category-1',
      created_by: 'user-1',
      type: 'despesa' as const,
      origin: 'manual' as const,
      status: 'pendente' as const,
      amount: 208.33,
      description: 'Celular novo',
      date: '2026-08-10',
      recurring_expense_id: null,
      installment_id: null,
      created_at: '2026-08-01T12:00:00.000Z',
      categories: {
        id: 'category-1',
        name: 'Celular',
        type: 'despesa',
        icon: null,
      },
    },
    {
      id: 'transaction-paid',
      workspace_id: 'workspace-1',
      category_id: null,
      created_by: 'user-1',
      type: 'despesa' as const,
      origin: 'manual' as const,
      status: 'pago' as const,
      amount: 50,
      description: 'Conta paga',
      date: '2026-08-05',
      recurring_expense_id: null,
      installment_id: null,
      created_at: '2026-08-01T12:00:00.000Z',
    },
  ],
}));

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mocks.navigate,
}));

vi.mock('@/context/WorkspaceContext', () => ({
  useWorkspace: () => ({ activeWorkspaceId: 'workspace-1' }),
}));

vi.mock('@/hooks/useTransactions', () => ({
  useTransactions: () => ({
    data: mocks.transactions,
    isLoading: false,
    isError: false,
  }),
}));

describe('NotificationBell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('abre as pendências sem navegar imediatamente', async () => {
    const user = userEvent.setup();
    render(<NotificationBell />);

    await user.click(
      screen.getByRole('button', { name: 'Pendências financeiras: 1' })
    );

    expect(screen.getByText('Celular novo')).toBeInTheDocument();
    expect(screen.queryByText('Conta paga')).not.toBeInTheDocument();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it('abre a transação pendente com período, filtro e destaque', async () => {
    const user = userEvent.setup();
    render(<NotificationBell />);

    await user.click(
      screen.getByRole('button', { name: 'Pendências financeiras: 1' })
    );
    await user.click(screen.getByRole('button', { name: /Celular novo/ }));

    expect(mocks.navigate).toHaveBeenCalledWith({
      to: '/admin/transactions',
      search: {
        month: 8,
        year: 2026,
        status: 'pendente',
        highlight: 'transaction-1',
      },
    });
  });
});
