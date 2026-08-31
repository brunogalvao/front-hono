import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const adminSource = readFileSync('src/pages/Admin.tsx', 'utf8');
const transactionsSource = readFileSync(
  'src/pages/admin/TransactionsPage.tsx',
  'utf8'
);
const monthPickerSource = readFileSync(
  'src/components/ui/month-year-picker.tsx',
  'utf8'
);

describe('authenticated shell responsive audit', () => {
  it('preserves useful content width on narrow screens', () => {
    expect(adminSource).toContain(
      'px-4 py-4 sm:px-6 sm:py-5 md:min-h-min md:px-8 md:py-6'
    );
  });

  it('stacks transaction header actions before the small breakpoint', () => {
    expect(transactionsSource).toContain(
      'flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center'
    );
  });

  it('keeps the month picker fluid with mobile touch targets', () => {
    expect(monthPickerSource).toContain(
      'min-h-11 w-full min-w-0 justify-between'
    );
    expect(monthPickerSource).toContain('size-11 md:size-7');
  });
});
