import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync(
  'src/components/installments/InstallmentForm.tsx',
  'utf8'
);

describe('InstallmentForm responsive contract', () => {
  it('stacks every paired field group before the sm breakpoint', () => {
    expect(source.match(/grid grid-cols-1 gap-3 sm:grid-cols-2/g)?.length).toBe(
      3
    );
    expect(source).not.toMatch(/grid grid-cols-2 gap-3/);
  });

  it('keeps inputs, selects and footer actions at least 44px tall on mobile', () => {
    expect(source.match(/min-h-11/g)?.length ?? 0).toBeGreaterThanOrEqual(12);
  });
});
