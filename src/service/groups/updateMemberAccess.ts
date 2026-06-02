import { fetchWithAuth } from '@/lib/fetch-api';
import type { GroupAccess } from './groupAccess';

export async function updateMemberAccess(
  groupId: string,
  userId: string,
  payload: Partial<GroupAccess>
): Promise<void> {
  await fetchWithAuth(`/api/groups/${groupId}/members/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
