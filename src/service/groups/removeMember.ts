import { fetchWithAuth } from '@/lib/fetch-api';

export async function removeMember(groupId: string, userId: string): Promise<void> {
  await fetchWithAuth(`/api/groups/${groupId}/members/${userId}`, { method: 'DELETE' });
}
