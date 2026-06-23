import { API_BASE_URL } from '@/config/api';
import type { InviteInfo } from '@/model/invite.model';

export type { InviteInfo };

export async function getInvite(token: string): Promise<InviteInfo> {
  const res = await fetch(`${API_BASE_URL}/api/invite/${token}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || `Convite inválido ou expirado.`);
  }
  return res.json();
}
