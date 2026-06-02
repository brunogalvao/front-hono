import { getAuthToken } from '@/lib/supabase';
import { API_BASE_URL } from '@/config/api';

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
    let msg = `Erro HTTP ${res.status}`;
    try {
      const data = await res.json();
      msg = data?.error ?? msg;
    } catch {}
    throw new Error(msg);
  }

  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
