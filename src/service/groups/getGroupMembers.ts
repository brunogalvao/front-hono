import { fetchWithAuth } from '@/lib/fetch-api';
import type { GroupMember } from '@/model/group.model';

export type { GroupMember };

export async function getGroupMembers(groupId: string): Promise<GroupMember[]> {
  return fetchWithAuth<GroupMember[]>(`/api/groups/${groupId}/members`);
}
