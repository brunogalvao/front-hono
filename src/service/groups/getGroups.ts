import { getAuthToken } from '@/lib/supabase';
import { API_BASE_URL } from '@/config/api';

export interface GroupItem {
  id: string;
  name: string;
  type: 'personal' | 'shared';
  owner_id: string;
  created_at: string;
  role: 'owner' | 'member';
  joined_at: string;
}

export async function getGroups(): Promise<GroupItem[]> {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE_URL}/api/groups`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || `Erro HTTP ${res.status}`);
  }
  return res.json();
}
