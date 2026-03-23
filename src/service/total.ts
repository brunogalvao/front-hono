import { API_BASE_URL } from '@/config/api';
import { getAuthToken } from '@/lib/supabase';

// Soma total de despesas do usuário logado
export const totalItems = async (): Promise<number> => {
  const token = await getAuthToken();

  const res = await fetch(`${API_BASE_URL}/api/tasks/total`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    console.error(`Erro: ${res.status}`);
    throw new Error('Erro ao buscar total de despesas');
  }

  const data = await res.json();
  return data.total;
};

// Soma total de preço das despesas do usuário logado
export const totalPrice = async (): Promise<number> => {
  const token = await getAuthToken();

  const res = await fetch(`${API_BASE_URL}/api/tasks/total-price`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    console.error(`Erro: ${res.status}`);
    throw new Error('Erro ao buscar total');
  }

  const data = await res.json();
  return data.totalPrice;
};

// Soma total de valores pagos (despesas com done = true) do usuário logado
export const totalPaid = async (): Promise<number> => {
  const token = await getAuthToken();

  const res = await fetch(`${API_BASE_URL}/api/tasks/total-paid`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    console.error(`Erro: ${res.status}`);
    throw new Error('Erro ao buscar total pago');
  }

  const data = await res.json();
  return data.total_paid;
};
