import { API_BASE_URL } from "@/config/api";
import type { Task } from "@/model/tasks.model";

export async function createTask(task: Task): Promise<Task> {
  const res = await fetch(`${API_BASE_URL}/tasks`, {
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
