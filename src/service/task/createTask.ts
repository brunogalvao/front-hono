import { API_BASE_URL } from '@/config/api';
import type { NewTask } from '@/model/tasks.model';
import { supabase } from '@/lib/supabase';

export async function createTask(task: NewTask): Promise<NewTask> {
  const session = await supabase.auth.getSession();
  const accessToken = session.data.session?.access_token;

  if (!accessToken) throw new Error('Usuário não autenticado.');

  const res = await fetch(`${API_BASE_URL}/api/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(task),
  });

  if (!res.ok) {
    console.error('Erro ao criar tarefa', await res.text());
    throw new Error('Erro ao criar tarefa');
  }

  return res.json();
}
