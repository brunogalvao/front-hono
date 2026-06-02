import { fetchWithAuth } from '@/lib/fetch-api';
import type { GroupAccess } from './groupAccess';

export interface GroupInvite extends GroupAccess {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  token: string;
  created_at: string;
  expires_at: string;
}

export async function getGroupInvites(groupId: string): Promise<GroupInvite[]> {
  return fetchWithAuth<GroupInvite[]>(`/api/groups/${groupId}/invites`);
}
