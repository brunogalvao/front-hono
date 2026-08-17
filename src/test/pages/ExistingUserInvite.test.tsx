import { describe, expect, it } from 'vitest';
import {
  clearWorkspaceInviteToken,
  readWorkspaceInviteToken,
  storeWorkspaceInviteToken,
} from '@/lib/workspace-invite-session';

describe('existing user invitation session continuity', () => {
  it('preserves the opaque invitation through password or OAuth redirects', () => {
    const token = 'f'.repeat(64);
    expect(storeWorkspaceInviteToken(token)).toBe(true);
    expect(readWorkspaceInviteToken()).toBe(token);
    expect(sessionStorage.getItem('pendingWorkspaceInviteToken')).toBe(token);
  });

  it('clears the invitation only after a terminal successful flow', () => {
    storeWorkspaceInviteToken('a'.repeat(64));
    clearWorkspaceInviteToken();
    expect(readWorkspaceInviteToken()).toBeNull();
  });
});
