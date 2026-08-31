import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const actionFiles = [
  'src/components/transactions/TransactionActionsCell.tsx',
  'src/components/installments/installment-columns.tsx',
  'src/components/recurring/recurring-columns.tsx',
];

describe('financial action accessibility', () => {
  it.each(actionFiles)(
    '%s names icon actions and uses 44px mobile targets',
    (file) => {
      const source = readFileSync(file, 'utf8');
      expect(source).toContain('aria-label=');
      expect(source).toMatch(/size-11|min-h-11/);
    }
  );
});
