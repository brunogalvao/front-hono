import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const incomeSource = readFileSync(
  'src/components/IncomesDataTable.tsx',
  'utf8'
);
const installmentSource = readFileSync(
  'src/components/installments/InstallmentTable.tsx',
  'utf8'
);

describe('income and installment responsive presentations', () => {
  it.each([
    ['income', incomeSource],
    ['installment', installmentSource],
  ])('renders a mobile list and desktop table for %s', (_name, source) => {
    expect(source).toContain('useIsMobile');
    expect(source).toContain('MobileRecordList');
    expect(source).toContain('md:block');
  });
});
