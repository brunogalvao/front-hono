import { API_BASE_URL } from "@/config/api";
import type { Task } from "@/model/tasks.model";
import { supabase } from "@/lib/supabase";

export const editTask = async (id: string, updated: Partial<Task>) => {
  const session = await supabase.auth.getSession();
  const accessToken = session.data.session?.access_token;

  if (!accessToken) throw new Error("Usuário não autenticado.");

  console.log("🌐 Enviando requisição para API:", {
    url: `${API_BASE_URL}/api/tasks/${id}`,
    method: "PUT",
    data: updated
  });

  const res = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(updated),
  });

  console.log("📡 Resposta da API:", {
    status: res.status,
    ok: res.ok,
    statusText: res.statusText
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("❌ Erro ao editar tarefa:", errorText);
    throw new Error(`Erro ao editar tarefa: ${errorText}`);
  }

  const result = await res.json();
  console.log("✅ Resposta da API (dados):", result);
  return result;
};
