import { fetchWithAuth } from '@/lib/fetch-api';

export async function acceptInvite(token: string): Promise<{ group_id: string }> {
  return fetchWithAuth<{ group_id: string }>(`/api/invite/${token}/accept`, {
    method: 'POST',
  });
}
