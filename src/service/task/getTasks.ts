import type { Task } from "@/model/tasks.model";
import { API_BASE_URL } from "@/config/api";
import { supabase } from "@/lib/supabase";

export const getTasks = async ({
  month,
  year,
}: {
  month: number;
  year: number;
}): Promise<Task[]> => {
  const session = await supabase.auth.getSession();
  const accessToken = session.data.session?.access_token;

  if (!accessToken) {
    throw new Error("Usuário não autenticado.");
  }

  const url = new URL(`${API_BASE_URL}/api/tasks`);
  url.searchParams.append("month", String(month));
  url.searchParams.append("year", String(year));

  const res = await fetch(url.toString(), {
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
