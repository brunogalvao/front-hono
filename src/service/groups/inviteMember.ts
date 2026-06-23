import { fetchWithAuth } from '@/lib/fetch-api';
import type { InvitePayload } from '@/model/group.model';

export type { InvitePayload };

export async function inviteMember(groupId: string, payload: InvitePayload): Promise<void> {
  await fetchWithAuth(`/api/groups/${groupId}/invite`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
