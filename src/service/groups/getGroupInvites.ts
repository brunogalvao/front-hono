import { fetchWithAuth } from '@/lib/fetch-api';
import type { GroupInvite } from '@/model/group.model';

export type { GroupInvite };

export async function getGroupInvites(groupId: string): Promise<GroupInvite[]> {
  return fetchWithAuth<GroupInvite[]>(`/api/groups/${groupId}/invites`);
}
