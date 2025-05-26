import { supabase } from "@/lib/supabase";
import { API_BASE_URL } from "@/config/api";

export async function deleteIncome(id: string): Promise<void> {
  const session = (await supabase.auth.getSession()).data.session;
  const token = session?.access_token;

  if (!token) throw new Error("Usuário não autenticado");

  const res = await fetch(`${API_BASE_URL}/api/incomes`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });

  if (!res.ok) {
    let msg = "Erro desconhecido";
    try {
      const data = await res.json();
      msg = data?.error || msg;
    } catch {
      msg = `Erro HTTP ${res.status}`;
    }
    throw new Error(msg);
  }
}
