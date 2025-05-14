import { API_BASE_URL } from "@/config/api";

export const deleteTask = async (id: string) => {
  const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    console.error("Erro ao deletar tarefa", await res.text());
    throw new Error("Erro ao deletar tarefa");
  }

  return res.json();
};
