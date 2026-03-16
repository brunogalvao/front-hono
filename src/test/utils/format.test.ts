import { describe, it, expect } from 'vitest';
import { formatToBRL, formatToUSD } from '@/utils/format';

describe('formatToBRL', () => {
  it('formata número inteiro', () => {
    expect(formatToBRL(1000)).toBe('R$\u00a01.000,00');
  });

  it('formata número decimal', () => {
    expect(formatToBRL(1580.5)).toBe('R$\u00a01.580,50');
  });

  it('formata string numérica', () => {
    expect(formatToBRL('4500')).toBe('R$\u00a04.500,00');
  });

  it('formata zero', () => {
    expect(formatToBRL(0)).toBe('R$\u00a00,00');
  });

  it('retorna erro para string inválida', () => {
    expect(formatToBRL('abc')).toBe('Valor inválido');
  });
});

describe('formatToUSD', () => {
  it('formata número para dólar', () => {
    expect(formatToUSD(1000)).toBe('$1,000.00');
  });

  it('retorna erro para string inválida', () => {
    expect(formatToUSD('xyz')).toBe('Valor inválido');
  });
});
