import { fetchWithAuth } from '@/lib/fetch-api';
import type { CreateGroupPayload, GroupItem } from '@/model/group.model';

export type { CreateGroupPayload };

export async function createGroup(payload: CreateGroupPayload): Promise<GroupItem> {
  return fetchWithAuth<GroupItem>('/api/groups', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
