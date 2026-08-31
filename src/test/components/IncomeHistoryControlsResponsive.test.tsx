import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const incomeSource = readFileSync(
  'src/components/IncomesDataTable.tsx',
  'utf8'
);
const historySource = readFileSync('src/pages/admin/History.tsx', 'utf8');
const incomePageSource = readFileSync('src/pages/admin/Income.tsx', 'utf8');
const incomeSkeletonSource = readFileSync(
  'src/components/SkeletonIncome.tsx',
  'utf8'
);

describe('income and history controls responsive contract', () => {
  it('stacks income filters and pagination on narrow screens', () => {
    expect(incomeSource).toContain('flex flex-col gap-3 py-4 sm:flex-row');
    expect(incomeSource).toMatch(/w-full[^"\n]*sm:w-auto/);
  });

  it('stacks the income form and preserves mobile touch targets', () => {
    expect(incomePageSource).toContain(
      'flex flex-col gap-4 sm:grid sm:grid-cols-2'
    );
    expect(incomePageSource).toMatch(/min-h-11 w-full/);
    expect(incomePageSource).not.toContain('flex flex-row gap-3');
  });

  it('uses mobile list skeletons without exposing the desktop grid', () => {
    expect(incomeSkeletonSource).toContain('space-y-3 md:hidden');
    expect(incomeSkeletonSource).toContain('hidden rounded-md border md:block');
  });

  it('uses one annual summary column at the narrowest viewport', () => {
    expect(historySource).toContain(
      'grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4'
    );
  });
});
