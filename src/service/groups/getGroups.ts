import { fetchWithAuth } from '@/lib/fetch-api';

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
  return fetchWithAuth<GroupItem[]>('/api/groups');
}
