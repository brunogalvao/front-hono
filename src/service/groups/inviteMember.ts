import { getAuthToken } from '@/lib/supabase';
import { API_BASE_URL } from '@/config/api';

export interface InvitePayload {
  name: string;
  email: string;
  phone?: string;
}

export async function inviteMember(groupId: string, payload: InvitePayload): Promise<void> {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE_URL}/api/groups/${groupId}/invite`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || `Erro HTTP ${res.status}`);
  }
}
