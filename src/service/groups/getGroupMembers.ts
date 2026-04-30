import type { GroupAccess } from './groupAccess';
import { getAuthToken } from '@/lib/supabase';
import { API_BASE_URL } from '@/config/api';

export interface GroupMember extends GroupAccess {
  user_id: string;
  role: 'owner' | 'member';
  joined_at: string;
  display_name: string | null;
  avatar_url: string | null;
  email: string | null;
}

export async function getGroupMembers(groupId: string): Promise<GroupMember[]> {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE_URL}/api/groups/${groupId}/members`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || `Erro HTTP ${res.status}`);
  }
  return res.json();
}
