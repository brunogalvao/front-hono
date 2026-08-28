const STORAGE_KEY = 'pendingWorkspaceInviteToken';
const PERSISTED_STORAGE_KEY = 'pendingWorkspaceInvite';
const MAX_TOKEN_AGE_MS = 24 * 60 * 60 * 1000;
const TOKEN_PATTERN = /^[a-f0-9]{64}$/;

type PersistedWorkspaceInvite = {
  token: string;
  capturedAt: number;
};

export function isWorkspaceInviteToken(value: unknown): value is string {
  return typeof value === 'string' && TOKEN_PATTERN.test(value);
}

export function storeWorkspaceInviteToken(token: string): boolean {
  if (!isWorkspaceInviteToken(token)) return false;
  sessionStorage.setItem(STORAGE_KEY, token);
  try {
    localStorage.setItem(
      PERSISTED_STORAGE_KEY,
      JSON.stringify({
        token,
        capturedAt: Date.now(),
      } satisfies PersistedWorkspaceInvite)
    );
  } catch {
    // sessionStorage still preserves the flow in the current tab.
  }
  return true;
}

export function readWorkspaceInviteToken(): string | null {
  const sessionToken = sessionStorage.getItem(STORAGE_KEY);
  if (isWorkspaceInviteToken(sessionToken)) return sessionToken;

  let persisted: string | null = null;
  try {
    persisted = localStorage.getItem(PERSISTED_STORAGE_KEY);
  } catch {
    return null;
  }
  if (!persisted) return null;

  try {
    const candidate = JSON.parse(
      persisted
    ) as Partial<PersistedWorkspaceInvite>;
    if (
      !isWorkspaceInviteToken(candidate.token) ||
      typeof candidate.capturedAt !== 'number' ||
      !Number.isFinite(candidate.capturedAt) ||
      candidate.capturedAt > Date.now() ||
      Date.now() - candidate.capturedAt > MAX_TOKEN_AGE_MS
    ) {
      clearWorkspaceInviteToken();
      return null;
    }

    sessionStorage.setItem(STORAGE_KEY, candidate.token);
    return candidate.token;
  } catch {
    clearWorkspaceInviteToken();
    return null;
  }
}

export function clearWorkspaceInviteToken(): void {
  sessionStorage.removeItem(STORAGE_KEY);
  try {
    localStorage.removeItem(PERSISTED_STORAGE_KEY);
  } catch {
    // Nothing else to clear when persistent storage is unavailable.
  }
}

export function captureWorkspaceInviteToken(url: URL): string | null {
  const token = url.searchParams.get('token');
  if (!storeWorkspaceInviteToken(token ?? '')) return null;
  url.searchParams.delete('token');
  window.history.replaceState(
    window.history.state,
    '',
    `${url.pathname}${url.search}${url.hash}`
  );
  return token;
}
