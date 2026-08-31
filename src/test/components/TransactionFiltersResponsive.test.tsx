import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync(
  'src/components/transactions/TransactionTable.tsx',
  'utf8'
);

describe('transaction filters and totals responsive contract', () => {
  it('stacks controls and lets selects use the available mobile width', () => {
    expect(source).toContain('flex flex-col gap-3 lg:flex-row');
    expect(
      source.match(/min-h-11 w-full/g)?.length ?? 0
    ).toBeGreaterThanOrEqual(2);
  });

  it('offers a localized way to clear an empty filtered state', () => {
    expect(source).toContain("t('table.clearFilters')");
    expect(source).toContain("onCategoryFilterChange('all')");
    expect(source).toContain("onStatusFilterChange('all')");
  });
});
