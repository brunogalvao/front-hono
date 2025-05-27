import { API_BASE_URL } from "@/config/api";
import { supabase } from "@/lib/supabase";

export const deleteTask = async (id: string) => {
  const session = await supabase.auth.getSession();
  const accessToken = session.data.session?.access_token;

  if (!accessToken) throw new Error("Usuário não autenticado.");

  const res = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    console.error("Erro ao deletar tarefa", await res.text());
    throw new Error("Erro ao deletar tarefa");
  }

  return res.json();
};
