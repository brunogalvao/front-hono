import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const recurringSource = readFileSync(
  'src/components/recurring/RecurringTable.tsx',
  'utf8'
);
const historySource = readFileSync('src/pages/admin/History.tsx', 'utf8');

describe('recurring and history responsive presentations', () => {
  it('renders recurring data and actions as a mobile record list', () => {
    expect(recurringSource).toContain('useIsMobile');
    expect(recurringSource).toContain('MobileRecordList');
    expect(recurringSource).toContain('RecurringActionsCell');
  });

  it('renders monthly summaries as a mobile list and preserves desktop table', () => {
    expect(historySource).toContain('MobileRecordList');
    expect(historySource).toContain('hidden md:block');
  });
});
