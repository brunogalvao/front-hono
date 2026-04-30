import { getAuthToken } from '@/lib/supabase';
import { API_BASE_URL } from '@/config/api';
import type { GroupAccess } from './groupAccess';

export interface GroupInvite extends GroupAccess {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  token: string;
  created_at: string;
  expires_at: string;
}

export async function getGroupInvites(groupId: string): Promise<GroupInvite[]> {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE_URL}/api/groups/${groupId}/invites`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || `Erro HTTP ${res.status}`);
  }

  return res.json();
}
