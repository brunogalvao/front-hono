import { API_BASE_URL } from '@/config/api';

export interface InviteInfo {
  email: string;
  group: { id: string; name: string };
  expires_at: string;
}

export async function getInvite(token: string): Promise<InviteInfo> {
  const res = await fetch(`${API_BASE_URL}/api/invite/${token}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || `Convite inválido ou expirado.`);
  }
  return res.json();
}
