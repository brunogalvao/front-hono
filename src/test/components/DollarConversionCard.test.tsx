import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DollarConversionCard } from '@/components/dashboard/DollarConversionCard';

const quoteProps = {
  cotacaoDolar: 5,
  marketUpdatedAt: '2026-10-12T23:57:31.000Z',
  sourceLabel: 'ExchangeRate-API',
  sourceUrl: 'https://www.exchangerate-api.com',
};

describe('DollarConversionCard', () => {
  it('shows the estimated USD equivalent for a positive balance', () => {
    render(<DollarConversionCard {...quoteProps} valorLivre={1000} />);

    expect(screen.getByText('$200.00')).toBeInTheDocument();
    expect(screen.getByText(/R\$\s*1\.000,00 disponíveis/)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Fonte: ExchangeRate-API/ })
    ).toHaveAttribute('href', 'https://www.exchangerate-api.com');
  });

  it('shows a deficit and never claims that zero dollars can be converted', () => {
    render(<DollarConversionCard {...quoteProps} valorLivre={-800.65} />);

    expect(screen.getByText('Déficit previsto no mês')).toBeInTheDocument();
    expect(screen.getByText(/R\$\s*800,65/)).toBeInTheDocument();
    expect(screen.queryByText('$0.00')).not.toBeInTheDocument();
    expect(screen.getByText(/Não há saldo disponível/)).toBeInTheDocument();
  });

  it('uses an explicit empty state when the monthly balance is zero', () => {
    render(<DollarConversionCard {...quoteProps} valorLivre={0} />);

    expect(screen.getByText('Sem saldo disponível')).toBeInTheDocument();
    expect(screen.queryByText('$0.00')).not.toBeInTheDocument();
  });

  it('does not render a fabricated rate when the quote is unavailable', () => {
    render(
      <DollarConversionCard
        isError
        cotacaoDolar={undefined}
        valorLivre={1000}
      />
    );

    expect(screen.getByText('Cotação indisponível')).toBeInTheDocument();
    expect(screen.getByText(/cotação confiável/)).toBeInTheDocument();
    expect(screen.queryByText(/1 USD/)).not.toBeInTheDocument();
  });
});
