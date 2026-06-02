import { fetchWithAuth } from '@/lib/fetch-api';

export const deleteTask = async ({
  id,
  cancelAll,
}: {
  id: string;
  cancelAll?: boolean;
}) => {
  const path = cancelAll ? `/api/tasks/${id}?cancel_all=true` : `/api/tasks/${id}`;
  return fetchWithAuth(path, { method: 'DELETE' });
};
