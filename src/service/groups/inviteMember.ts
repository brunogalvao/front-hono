import type { GroupAccess } from './groupAccess';
import { fetchWithAuth } from '@/lib/fetch-api';

export interface InvitePayload extends GroupAccess {
  name: string;
  email: string;
  phone?: string;
}

export async function inviteMember(groupId: string, payload: InvitePayload): Promise<void> {
  await fetchWithAuth(`/api/groups/${groupId}/invite`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
