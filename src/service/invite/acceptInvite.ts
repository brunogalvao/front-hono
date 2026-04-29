import { getAuthToken } from '@/lib/supabase';
import { API_BASE_URL } from '@/config/api';

export async function acceptInvite(token: string): Promise<{ group_id: string }> {
  const authToken = await getAuthToken();
  const res = await fetch(`${API_BASE_URL}/api/invite/${token}/accept`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${authToken}` },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || `Erro ao aceitar convite.`);
  }
  return res.json();
}
