import { fetchWithAuth } from '@/lib/fetch-api';
import type { GroupAccess } from './groupAccess';

export async function updateInviteAccess(
  groupId: string,
  inviteId: string,
  payload: Partial<GroupAccess>
): Promise<void> {
  await fetchWithAuth(`/api/groups/${groupId}/invites/${inviteId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
