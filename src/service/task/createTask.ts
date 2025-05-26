import { API_BASE_URL } from "@/config/api";
import type { NewTask } from "@/model/tasks.model";

export async function createTask(task: NewTask): Promise<NewTask> {
  const res = await fetch(`${API_BASE_URL}/api/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(task),
  });

  if (!res.ok) {
    console.error("Erro ao criar tarefa", await res.text());
    throw new Error("Erro ao criar task");
  }

  return res.json();
}
