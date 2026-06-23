import { fetchWithAuth } from '@/lib/fetch-api';
import type { GroupItem } from '@/model/group.model';

export type { GroupItem };

export async function getGroups(): Promise<GroupItem[]> {
  return fetchWithAuth<GroupItem[]>('/api/groups');
}
