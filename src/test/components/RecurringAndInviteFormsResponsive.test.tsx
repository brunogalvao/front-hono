import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const recurringSource = readFileSync(
  'src/components/recurring/RecurringForm.tsx',
  'utf8'
);
const inviteSource = readFileSync(
  'src/components/workspace/InviteForm.tsx',
  'utf8'
);

describe('recurring and invite responsive contracts', () => {
  it('stacks recurring dates and uses mobile touch targets', () => {
    expect(recurringSource).toContain('grid grid-cols-1 gap-3 sm:grid-cols-2');
    expect(
      recurringSource.match(/min-h-11/g)?.length ?? 0
    ).toBeGreaterThanOrEqual(9);
  });

  it('lets every invite control occupy the available mobile width', () => {
    expect(inviteSource).toContain('w-full sm:w-44');
    expect(inviteSource).toMatch(/w-full[^"\n]*sm:w-auto/);
    expect(inviteSource.match(/min-h-11/g)?.length ?? 0).toBeGreaterThanOrEqual(
      3
    );
  });
});
