import { getAuthToken } from '@/lib/supabase';
import { API_BASE_URL } from '@/config/api';

export async function removeMember(groupId: string, userId: string): Promise<void> {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE_URL}/api/groups/${groupId}/members/${userId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || `Erro HTTP ${res.status}`);
  }
}
