import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const tableSource = readFileSync(
  'src/components/transactions/TransactionTable.tsx',
  'utf8'
);
const skeletonSource = readFileSync(
  'src/components/transactions/TransactionTableSkeleton.tsx',
  'utf8'
);

describe('TransactionTable responsive presentation', () => {
  it('uses the shared mobile mode and semantic record list', () => {
    expect(tableSource).toContain('useIsMobile');
    expect(tableSource).toContain('MobileRecordList');
    expect(tableSource).toContain('<TransactionActionsCell');
  });

  it('has distinct mobile and desktop loading presentations', () => {
    expect(skeletonSource).toContain('MobileRecordList');
    expect(skeletonSource).toMatch(/hidden[^"\n]*md:block/);
  });
});
