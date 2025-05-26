import type { Task } from "@/model/tasks.model";
import { API_BASE_URL } from "@/config/api";

export const getTasks = async (): Promise<Task[]> => {
  const res = await fetch(`${API_BASE_URL}/api/tasks`);

  if (!res.ok) {
    console.error(`Erro: ${res.status}`);
    throw new Error("Erro ao buscar tarefas");
  }

  return res.json();
};
