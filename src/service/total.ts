import { API_BASE_URL } from '@/config/api';
import { supabase } from '@/lib/supabase';

// Soma total de tarefas do usuário logado
export const totalItems = async (): Promise<number> => {
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;

  if (!token) throw new Error('Usuário não autenticado.');

  const res = await fetch(`${API_BASE_URL}/api/tasks/total`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    console.error(`Erro: ${res.status}`);
    throw new Error('Erro ao buscar total de tarefas');
  }

  const data = await res.json();
  return data.total;
};

// Soma total de preço das tarefas do usuário logado
export const totalPrice = async (): Promise<number> => {
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;

  if (!token) throw new Error('Usuário não autenticado.');

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

// Soma total de valores pagos (tarefas com done = true) do usuário logado
export const totalPaid = async (): Promise<number> => {
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;

  if (!token) throw new Error('Usuário não autenticado.');

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
