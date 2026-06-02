import { fetchWithAuth } from '@/lib/fetch-api';
import type { GroupItem } from './getGroups';

export interface CreateGroupPayload {
  name: string;
  type: 'personal' | 'shared';
}

export async function createGroup(payload: CreateGroupPayload): Promise<GroupItem> {
  return fetchWithAuth<GroupItem>('/api/groups', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
