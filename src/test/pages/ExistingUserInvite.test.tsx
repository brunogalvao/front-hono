import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearWorkspaceInviteToken,
  readWorkspaceInviteToken,
  storeWorkspaceInviteToken,
} from '@/lib/workspace-invite-session';

const localValues = new Map<string, string>();
vi.stubGlobal('localStorage', {
  get length() {
    return localValues.size;
  },
  clear: () => localValues.clear(),
  getItem: (key: string) => localValues.get(key) ?? null,
  key: (index: number) => [...localValues.keys()][index] ?? null,
  removeItem: (key: string) => localValues.delete(key),
  setItem: (key: string, value: string) => localValues.set(key, String(value)),
} satisfies Storage);

describe('existing user invitation session continuity', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    vi.useRealTimers();
  });

  it('preserves the opaque invitation through password or OAuth redirects', () => {
    const token = 'f'.repeat(64);
    expect(storeWorkspaceInviteToken(token)).toBe(true);
    expect(readWorkspaceInviteToken()).toBe(token);
    expect(sessionStorage.getItem('pendingWorkspaceInviteToken')).toBe(token);
  });

  it('restores the invitation when authentication returns in another tab', () => {
    const token = 'b'.repeat(64);
    storeWorkspaceInviteToken(token);
    sessionStorage.clear();

    expect(readWorkspaceInviteToken()).toBe(token);
    expect(sessionStorage.getItem('pendingWorkspaceInviteToken')).toBe(token);
  });

  it('discards persisted invitation tokens after 24 hours', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-19T12:00:00.000Z'));
    storeWorkspaceInviteToken('c'.repeat(64));
    sessionStorage.clear();
    vi.setSystemTime(new Date('2026-08-20T12:00:01.000Z'));

    expect(readWorkspaceInviteToken()).toBeNull();
    expect(localStorage.getItem('pendingWorkspaceInvite')).toBeNull();
  });

  it('clears the invitation only after a terminal successful flow', () => {
    storeWorkspaceInviteToken('a'.repeat(64));
    clearWorkspaceInviteToken();
    expect(readWorkspaceInviteToken()).toBeNull();
    expect(localStorage.getItem('pendingWorkspaceInvite')).toBeNull();
  });
});
