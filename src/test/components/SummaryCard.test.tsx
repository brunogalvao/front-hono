import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SummaryCard } from '@/components/dashboard/SummaryCard';

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

const baseSummary = {
  total_receitas: 1_000,
  total_despesas: 700,
  saldo: 300,
  by_category: [],
};

describe('SummaryCard', () => {
  it('explains the consolidated workspace result', () => {
    render(
      <SummaryCard
        title="Casa"
        context="Resultado consolidado de todos os membros em outubro de 2026."
        scope="workspace"
        summary={baseSummary}
        month={10}
        year={2026}
      />
    );

    expect(screen.getByText('Casa')).toBeInTheDocument();
    expect(screen.getByText('Saldo disponível no mês')).toBeInTheDocument();
    expect(
      screen.getByText(/workspace recebeu mais do que gastou/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Ver transações do workspace/i })
    ).toHaveAttribute('href', '/admin/transactions');
  });

  it('makes clear that the personal card represents entries created by the user', () => {
    render(
      <SummaryCard
        title="Meus lançamentos"
        context="Registros adicionados por você em outubro de 2026."
        scope="personal"
        summary={{ ...baseSummary, saldo: -200, total_despesas: 1_200 }}
        expenseShare={42}
        month={10}
        year={2026}
      />
    );

    expect(screen.getByText('Déficit previsto no mês')).toBeInTheDocument();
    expect(
      screen.getByText(/despesas superam as receitas/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/42% das despesas do workspace/i)
    ).toBeInTheDocument();
  });
});
