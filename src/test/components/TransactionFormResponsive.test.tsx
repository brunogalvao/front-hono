import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync(
  'src/components/transactions/TransactionForm.tsx',
  'utf8'
);

describe('TransactionForm responsive contract', () => {
  it('stacks paired fields on mobile and preserves two columns from sm', () => {
    expect(source).toContain('grid grid-cols-1 gap-3 sm:grid-cols-2');
    expect(source).not.toMatch(/grid grid-cols-2 gap-3/);
  });

  it('provides mobile touch targets for fields and final actions', () => {
    expect(source.match(/min-h-11/g)?.length ?? 0).toBeGreaterThanOrEqual(7);
  });
});
