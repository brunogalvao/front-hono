import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import IARecommendations from '@/components/IARecommendations';

describe('IARecommendations', () => {
  it('uses the committed balance consistently when the month has a deficit', () => {
    render(
      <IARecommendations
        data={{
          despesasPagas: 149.83,
          despesasPendentes: 650.82,
          totalDespesas: 800.65,
          rendimentoMes: 0,
          percentualDisponivel: 0,
          percentualGasto: 100,
          resultadoLiquido: -149.83,
          valorLivre: -800.65,
          cotacaoDolar: 5,
          quantidadeDolar: 0,
        }}
      />
    );

    expect(screen.getByText('Crítico')).toBeInTheDocument();
    expect(screen.getByText('Sem saldo disponível')).toBeInTheDocument();
    expect(screen.getByText('Déficit previsto no mês')).toBeInTheDocument();
    expect(screen.getByText(/-R\$\s*800,65/)).toBeInTheDocument();
    expect(screen.queryByText('$0.00')).not.toBeInTheDocument();
  });
});
