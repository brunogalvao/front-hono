import { supabase } from "@/lib/supabase";
import { API_BASE_URL } from "@/config/api";
import type { IncomeItem } from "@/model/incomes.model";

export async function editIncome(
  income: Partial<IncomeItem> & { id: string },
): Promise<IncomeItem> {
  const session = (await supabase.auth.getSession()).data.session;
  const token = session?.access_token;

  if (!token) throw new Error("Usuário não autenticado");

  const res = await fetch(`${API_BASE_URL}/api/incomes`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(income),
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

  return res.json();
}
