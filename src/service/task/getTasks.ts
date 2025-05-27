import type { Task } from "@/model/tasks.model";
import { API_BASE_URL } from "@/config/api";
import { supabase } from "@/lib/supabase";

export const getTasks = async (): Promise<Task[]> => {
  const session = await supabase.auth.getSession();

  const accessToken = session.data.session?.access_token;
  if (!accessToken) {
    throw new Error("Usuário não autenticado.");
  }

  const res = await fetch(`${API_BASE_URL}/api/tasks`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    console.error(`Erro: ${res.status}`);
    throw new Error("Erro ao buscar tarefas");
  }

  return res.json();
};
