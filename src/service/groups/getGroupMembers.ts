import type { GroupAccess } from './groupAccess';
import { fetchWithAuth } from '@/lib/fetch-api';

export interface GroupMember extends GroupAccess {
  user_id: string;
  role: 'owner' | 'member';
  joined_at: string;
  display_name: string | null;
  avatar_url: string | null;
  email: string | null;
}

export async function getGroupMembers(groupId: string): Promise<GroupMember[]> {
  return fetchWithAuth<GroupMember[]>(`/api/groups/${groupId}/members`);
}
