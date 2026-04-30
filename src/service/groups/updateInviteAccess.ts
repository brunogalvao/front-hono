import { getAuthToken } from '@/lib/supabase';
import { API_BASE_URL } from '@/config/api';
import type { GroupAccess } from './groupAccess';

export async function updateInviteAccess(
  groupId: string,
  inviteId: string,
  payload: Partial<GroupAccess>
): Promise<void> {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE_URL}/api/groups/${groupId}/invites/${inviteId}`, {
    method: 'PATCH',
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
