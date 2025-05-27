import { API_BASE_URL } from "@/config/api";
import type { Task } from "@/model/tasks.model";
import { supabase } from "@/lib/supabase";

export const editTask = async (id: string, updated: Partial<Task>) => {
  const session = await supabase.auth.getSession();
  const accessToken = session.data.session?.access_token;

  if (!accessToken) throw new Error("Usuário não autenticado.");

  const res = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(updated),
  });

  if (!res.ok) {
    console.error("Erro ao editar tarefa", await res.text());
    throw new Error("Erro ao editar tarefa");
  }

  return res.json();
};
