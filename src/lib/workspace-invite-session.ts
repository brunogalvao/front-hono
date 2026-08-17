const STORAGE_KEY = 'pendingWorkspaceInviteToken';
const TOKEN_PATTERN = /^[a-f0-9]{64}$/;

export function isWorkspaceInviteToken(value: unknown): value is string {
  return typeof value === 'string' && TOKEN_PATTERN.test(value);
}

export function storeWorkspaceInviteToken(token: string): boolean {
  if (!isWorkspaceInviteToken(token)) return false;
  sessionStorage.setItem(STORAGE_KEY, token);
  return true;
}

export function readWorkspaceInviteToken(): string | null {
  const token = sessionStorage.getItem(STORAGE_KEY);
  return isWorkspaceInviteToken(token) ? token : null;
}

export function clearWorkspaceInviteToken(): void {
  sessionStorage.removeItem(STORAGE_KEY);
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
