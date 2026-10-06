import { getAuthToken } from '@/lib/supabase';
import { API_BASE_URL } from '@/config/api';
import { createApiError, type ApiErrorPayload } from '@/lib/api-error';

export async function fetchWithAuth<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const token = await getAuthToken();

  const isFormData = options?.body instanceof FormData;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });

  if (!res.ok) {
    let payload: ApiErrorPayload = {};
    try {
      payload = (await res.json()) as ApiErrorPayload;
    } catch {
      // A resposta pode não possuir corpo JSON (proxy, timeout ou gateway).
    }
    throw createApiError(res.status, payload, res.headers.get('X-Request-Id'));
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
