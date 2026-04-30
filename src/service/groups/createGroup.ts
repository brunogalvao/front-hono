import { getAuthToken } from '@/lib/supabase';
import { API_BASE_URL } from '@/config/api';
import type { GroupItem } from './getGroups';

export interface CreateGroupPayload {
  name: string;
  type: 'personal' | 'shared';
}

export async function createGroup(payload: CreateGroupPayload): Promise<GroupItem> {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE_URL}/api/groups`, {
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

  return res.json();
}
