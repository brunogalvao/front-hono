import { API_BASE_URL } from "@/config/api";
import type { Task } from "@/model/tasks.model";

export const editTask = async (id: string, updated: Partial<Task>) => {
  const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updated),
  });

  if (!res.ok) {
    console.error("Erro ao editar tarefa", await res.text());
    throw new Error("Erro ao editar tarefa");
  }

  return res.json();
};
