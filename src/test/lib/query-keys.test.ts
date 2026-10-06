import { describe, expect, it } from 'vitest';
import { isQueryForWorkspace, queryKeys } from '@/lib/query-keys';

describe('workspace query keys', () => {
  it('matches only cache entries for the selected workspace', () => {
    expect(
      isQueryForWorkspace(
        queryKeys.transactions.list('workspace-a', 10, 2026),
        'workspace-a'
      )
    ).toBe(true);
    expect(
      isQueryForWorkspace(
        queryKeys.transactions.list('workspace-b', 10, 2026),
        'workspace-a'
      )
    ).toBe(false);
  });

  it('does not invalidate unrelated global domains', () => {
    expect(isQueryForWorkspace(queryKeys.user.profile, 'workspace-a')).toBe(
      false
    );
  });
});
