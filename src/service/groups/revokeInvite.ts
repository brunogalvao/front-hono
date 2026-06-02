import { fetchWithAuth } from '@/lib/fetch-api';

export async function revokeInvite(groupId: string, inviteId: string): Promise<void> {
  await fetchWithAuth(`/api/groups/${groupId}/invites/${inviteId}`, { method: 'DELETE' });
}
